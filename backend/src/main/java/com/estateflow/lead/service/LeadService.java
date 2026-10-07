package com.estateflow.lead.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.estateflow.common.exception.ResourceNotFoundException;
import com.estateflow.lead.dto.LeadResponse;
import com.estateflow.lead.entity.Lead;
import com.estateflow.lead.entity.LeadActivity;
import com.estateflow.lead.entity.LeadActivityType;
import com.estateflow.lead.mapper.LeadMapper;
import com.estateflow.lead.repository.LeadActivityRepository;
import com.estateflow.lead.repository.LeadRepository;
import com.estateflow.user.entity.RoleName;
import com.estateflow.user.entity.User;
import com.estateflow.user.repository.UserRepository;
import java.time.LocalDateTime;

import com.estateflow.common.exception.BadRequestException;
import com.estateflow.common.exception.ConflictException;
import com.estateflow.lead.dto.UpdateLeadStageRequest;
import com.estateflow.lead.entity.LeadStage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import com.estateflow.common.dto.PageResponse;
import com.estateflow.lead.entity.LeadPriority;
import com.estateflow.lead.specification.LeadSpecification;
import com.estateflow.lead.dto.LeadActivityResponse;

@Service
public class LeadService {

	private final LeadRepository leadRepository;
	private final LeadActivityRepository leadActivityRepository;
	private final UserRepository userRepository;
	private final LeadMapper leadMapper;
	private final LeadStageTransitionValidator stageTransitionValidator;

	public LeadService(LeadRepository leadRepository, LeadActivityRepository leadActivityRepository,
			UserRepository userRepository, LeadMapper leadMapper,
			LeadStageTransitionValidator stageTransitionValidator) {

		this.leadRepository = leadRepository;
		this.leadActivityRepository = leadActivityRepository;
		this.userRepository = userRepository;
		this.leadMapper = leadMapper;
		this.stageTransitionValidator = stageTransitionValidator;
	}

	@Transactional(readOnly = true)
	public List<LeadResponse> getAllLeads() {

		return leadRepository.findAllByOrderByCreatedAtDesc().stream().map(leadMapper::toResponse).toList();
	}

	@Transactional(readOnly = true)
	public List<LeadResponse> getAssignedLeads(Long agentUserId) {

		return leadRepository.findByAssignedAgentIdOrderByCreatedAtDesc(agentUserId).stream()
				.map(leadMapper::toResponse).toList();
	}

	@Transactional(readOnly = true)
	public LeadResponse getLead(Long leadId, Long currentUserId, boolean admin) {

		Lead lead = getLeadEntity(leadId);

		validateLeadAccess(lead, currentUserId, admin);

		return leadMapper.toResponse(lead);
	}

	@Transactional
	public LeadResponse assignLead(Long leadId, Long agentUserId, Long performedByUserId) {

		Lead lead = getLeadEntity(leadId);

		User agent = userRepository.findByIdAndRolesName(agentUserId, RoleName.AGENT)
				.orElseThrow(() -> new ResourceNotFoundException("Agent not found"));

		User performedBy = userRepository.findById(performedByUserId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		lead.setAssignedAgent(agent);

		Lead savedLead = leadRepository.save(lead);

		LeadActivity activity = new LeadActivity();

		activity.setLead(savedLead);
		activity.setPerformedBy(performedBy);
		activity.setActivityType(LeadActivityType.ASSIGNED);
		activity.setDescription("Lead assigned to agent " + agent.getFullName());

		activity.setOldStage(null);
		activity.setNewStage(null);

		leadActivityRepository.save(activity);

		return leadMapper.toResponse(savedLead);
	}

	private Lead getLeadEntity(Long leadId) {

		return leadRepository.findById(leadId).orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
	}

	@Transactional
	public LeadResponse updateStage(Long leadId, Long currentUserId, boolean admin, UpdateLeadStageRequest request) {

		Lead lead = getLeadEntity(leadId);

		validateLeadAccess(lead, currentUserId, admin);

		LeadStage oldStage = lead.getStage();
		LeadStage newStage = request.stage();

		if (newStage == LeadStage.VISIT_SCHEDULED || newStage == LeadStage.VISIT_COMPLETED) {

			throw new ConflictException("Visit-related lead stages must be changed through the site visit workflow");
		}

		stageTransitionValidator.validate(oldStage, newStage);

		String lostReason = normalizeLostReason(request.lostReason());

		if (newStage == LeadStage.LOST && lostReason == null) {

			throw new BadRequestException("lostReason is required when marking a lead as LOST");
		}

		lead.setStage(newStage);

		if (newStage == LeadStage.LOST) {
			lead.setLostReason(lostReason);
			lead.setConvertedAt(null);
		} else {
			lead.setLostReason(null);
		}

		if (newStage == LeadStage.CONVERTED) {
			lead.setConvertedAt(LocalDateTime.now());
		}

		Lead savedLead = leadRepository.save(lead);

		User performedBy = userRepository.findById(currentUserId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		LeadActivity activity = new LeadActivity();

		activity.setLead(savedLead);
		activity.setPerformedBy(performedBy);
		activity.setActivityType(LeadActivityType.STAGE_CHANGED);

		activity.setDescription("Lead stage changed from " + oldStage + " to " + newStage);

		activity.setOldStage(oldStage);
		activity.setNewStage(newStage);

		leadActivityRepository.save(activity);

		return leadMapper.toResponse(savedLead);
	}

	private void validateLeadAccess(Lead lead, Long currentUserId, boolean admin) {

		if (admin) {
			return;
		}

		if (lead.getAssignedAgent() == null || !lead.getAssignedAgent().getId().equals(currentUserId)) {

			throw new AccessDeniedException("You do not have access to this lead");
		}
	}

	private String normalizeLostReason(String lostReason) {

		if (lostReason == null) {
			return null;
		}

		String trimmed = lostReason.trim();

		return trimmed.isEmpty() ? null : trimmed;
	}

	@Transactional(readOnly = true)
	public PageResponse<LeadResponse> searchLeads(Long currentUserId, boolean admin, LeadStage stage,
			LeadPriority priority, Long assignedAgentId, Pageable pageable) {

		Specification<Lead> specification = Specification.allOf(LeadSpecification.hasStage(stage),
				LeadSpecification.hasPriority(priority));

		if (admin) {

			if (assignedAgentId != null) {
				specification = specification.and(LeadSpecification.assignedTo(assignedAgentId));
			}

		} else {

			specification = specification.and(LeadSpecification.assignedTo(currentUserId));
		}

		Page<LeadResponse> page = leadRepository.findAll(specification, pageable).map(leadMapper::toResponse);

		return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(), page.getTotalElements(),
				page.getTotalPages(), page.isFirst(), page.isLast());
	}

	@Transactional(readOnly = true)
	public List<LeadActivityResponse> getActivities(Long leadId, Long currentUserId, boolean admin) {

		Lead lead = getLeadEntity(leadId);

		validateLeadAccess(lead, currentUserId, admin);

		return leadActivityRepository.findByLeadIdOrderByCreatedAtAsc(leadId).stream()
				.map(activity -> new LeadActivityResponse(activity.getId(), activity.getLead().getId(),

						activity.getPerformedBy().getId(), activity.getPerformedBy().getFullName(),

						activity.getActivityType(), activity.getDescription(),

						activity.getOldStage(), activity.getNewStage(),

						activity.getCreatedAt()))
				.toList();
	}
}