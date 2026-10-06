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

@Service
public class LeadService {

	private final LeadRepository leadRepository;
	private final LeadActivityRepository leadActivityRepository;
	private final UserRepository userRepository;
	private final LeadMapper leadMapper;

	public LeadService(LeadRepository leadRepository, LeadActivityRepository leadActivityRepository,
			UserRepository userRepository, LeadMapper leadMapper) {

		this.leadRepository = leadRepository;
		this.leadActivityRepository = leadActivityRepository;
		this.userRepository = userRepository;
		this.leadMapper = leadMapper;
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

		if (!admin) {

			if (lead.getAssignedAgent() == null || !lead.getAssignedAgent().getId().equals(currentUserId)) {

				throw new AccessDeniedException("You do not have access to this lead");
			}
		}

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
}