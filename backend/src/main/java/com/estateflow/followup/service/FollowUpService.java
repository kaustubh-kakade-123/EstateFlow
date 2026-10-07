package com.estateflow.followup.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.estateflow.common.exception.ConflictException;
import com.estateflow.common.exception.ResourceNotFoundException;
import com.estateflow.followup.dto.CreateFollowUpRequest;
import com.estateflow.followup.dto.FollowUpResponse;
import com.estateflow.followup.entity.FollowUp;
import com.estateflow.followup.entity.FollowUpStatus;
import com.estateflow.followup.mapper.FollowUpMapper;
import com.estateflow.followup.repository.FollowUpRepository;
import com.estateflow.lead.entity.Lead;
import com.estateflow.lead.entity.LeadActivity;
import com.estateflow.lead.entity.LeadActivityType;
import com.estateflow.lead.entity.LeadStage;
import com.estateflow.lead.repository.LeadActivityRepository;
import com.estateflow.lead.repository.LeadRepository;
import com.estateflow.user.entity.User;
import com.estateflow.user.repository.UserRepository;
import java.time.LocalDateTime;

import com.estateflow.followup.dto.UpdateFollowUpStatusRequest;

@Service
public class FollowUpService {

	private final FollowUpRepository followUpRepository;
	private final LeadRepository leadRepository;
	private final LeadActivityRepository leadActivityRepository;
	private final UserRepository userRepository;
	private final FollowUpMapper followUpMapper;

	public FollowUpService(FollowUpRepository followUpRepository, LeadRepository leadRepository,
			LeadActivityRepository leadActivityRepository, UserRepository userRepository,
			FollowUpMapper followUpMapper) {

		this.followUpRepository = followUpRepository;
		this.leadRepository = leadRepository;
		this.leadActivityRepository = leadActivityRepository;
		this.userRepository = userRepository;
		this.followUpMapper = followUpMapper;
	}

	@Transactional
	public FollowUpResponse createFollowUp(Long leadId, Long currentUserId, boolean admin,
			CreateFollowUpRequest request) {

		Lead lead = getLead(leadId);

		validateAccess(lead, currentUserId, admin);

		if (lead.getStage() == LeadStage.CONVERTED || lead.getStage() == LeadStage.LOST) {

			throw new ConflictException("Follow-up cannot be created for a terminal lead");
		}

		if (lead.getStage() == LeadStage.VISIT_SCHEDULED) {

			throw new ConflictException("Follow-up cannot be created while a site visit is scheduled");
		}

		if (followUpRepository.existsByLeadIdAndStatus(leadId, FollowUpStatus.PENDING)) {

			throw new ConflictException("Lead already has a pending follow-up");
		}

		User assignedTo;

		if (lead.getAssignedAgent() != null) {
			assignedTo = lead.getAssignedAgent();
		} else if (admin) {
			assignedTo = getUser(currentUserId);
		} else {
			throw new ConflictException("Lead must be assigned before creating a follow-up");
		}

		FollowUp followUp = new FollowUp();

		followUp.setLead(lead);
		followUp.setAssignedTo(assignedTo);
		followUp.setScheduledAt(request.scheduledAt());
		followUp.setStatus(FollowUpStatus.PENDING);
		followUp.setNote(normalizeNote(request.note()));

		FollowUp savedFollowUp = followUpRepository.save(followUp);

		LeadStage oldStage = lead.getStage();

		/*
		 * VISIT_COMPLETED and NEGOTIATION are allowed to move to FOLLOW_UP according to
		 * our state machine. NEW is intentionally not changed automatically.
		 */
		if (oldStage == LeadStage.CONTACTED || oldStage == LeadStage.QUALIFIED || oldStage == LeadStage.VISIT_COMPLETED
				|| oldStage == LeadStage.NEGOTIATION) {

			lead.setStage(LeadStage.FOLLOW_UP);

			leadRepository.save(lead);
		}

		User performedBy = getUser(currentUserId);

		LeadActivity activity = new LeadActivity();

		activity.setLead(lead);
		activity.setPerformedBy(performedBy);
		activity.setActivityType(LeadActivityType.FOLLOW_UP_CREATED);

		activity.setDescription("Follow-up scheduled for " + request.scheduledAt());

		activity.setOldStage(oldStage);
		activity.setNewStage(lead.getStage());

		leadActivityRepository.save(activity);

		return followUpMapper.toResponse(savedFollowUp);
	}

	@Transactional(readOnly = true)
	public List<FollowUpResponse> getFollowUps(Long leadId, Long currentUserId, boolean admin) {

		Lead lead = getLead(leadId);

		validateAccess(lead, currentUserId, admin);

		return followUpRepository.findByLeadIdOrderByScheduledAtDesc(leadId).stream().map(followUpMapper::toResponse)
				.toList();
	}

	private Lead getLead(Long leadId) {

		return leadRepository.findById(leadId).orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
	}

	private User getUser(Long userId) {

		return userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
	}

	private void validateAccess(Lead lead, Long currentUserId, boolean admin) {

		if (admin) {
			return;
		}

		if (lead.getAssignedAgent() == null || !lead.getAssignedAgent().getId().equals(currentUserId)) {

			throw new AccessDeniedException("You do not have access to this lead");
		}
	}

	private String normalizeNote(String note) {

		if (note == null) {
			return null;
		}

		String trimmed = note.trim();

		return trimmed.isEmpty() ? null : trimmed;
	}

	@Transactional
	public FollowUpResponse updateStatus(Long followUpId, Long currentUserId, boolean admin,
			UpdateFollowUpStatusRequest request) {

		FollowUp followUp = getFollowUp(followUpId);

		Lead lead = followUp.getLead();

		validateAccess(lead, currentUserId, admin);

		if (followUp.getStatus() != FollowUpStatus.PENDING) {

			throw new ConflictException("Only a pending follow-up can be updated");
		}

		if (request.status() == FollowUpStatus.PENDING) {

			throw new ConflictException("Follow-up is already pending");
		}

		followUp.setStatus(request.status());

		if (request.status() == FollowUpStatus.COMPLETED) {

			followUp.setCompletedAt(LocalDateTime.now());

		} else if (request.status() == FollowUpStatus.CANCELLED) {

			followUp.setCompletedAt(null);
		}

		return followUpMapper.toResponse(followUpRepository.save(followUp));
	}

	private FollowUp getFollowUp(Long followUpId) {

		return followUpRepository.findById(followUpId)
				.orElseThrow(() -> new ResourceNotFoundException("Follow-up not found"));
	}
}