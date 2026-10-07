package com.estateflow.visit.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.estateflow.common.exception.ConflictException;
import com.estateflow.common.exception.ResourceNotFoundException;
import com.estateflow.lead.entity.Lead;
import com.estateflow.lead.entity.LeadActivity;
import com.estateflow.lead.entity.LeadActivityType;
import com.estateflow.lead.entity.LeadStage;
import com.estateflow.lead.repository.LeadActivityRepository;
import com.estateflow.lead.repository.LeadRepository;
import com.estateflow.user.entity.User;
import com.estateflow.user.repository.UserRepository;
import com.estateflow.visit.dto.CreateSiteVisitRequest;
import com.estateflow.visit.dto.SiteVisitResponse;
import com.estateflow.visit.entity.SiteVisit;
import com.estateflow.visit.entity.SiteVisitStatus;
import com.estateflow.visit.mapper.SiteVisitMapper;
import com.estateflow.visit.repository.SiteVisitRepository;
import java.time.LocalDateTime;

import com.estateflow.visit.dto.RescheduleSiteVisitRequest;
import com.estateflow.visit.dto.UpdateSiteVisitStatusRequest;

@Service
public class SiteVisitService {

	private final SiteVisitRepository siteVisitRepository;
	private final LeadRepository leadRepository;
	private final LeadActivityRepository leadActivityRepository;
	private final UserRepository userRepository;
	private final SiteVisitMapper siteVisitMapper;

	public SiteVisitService(SiteVisitRepository siteVisitRepository, LeadRepository leadRepository,
			LeadActivityRepository leadActivityRepository, UserRepository userRepository,
			SiteVisitMapper siteVisitMapper) {

		this.siteVisitRepository = siteVisitRepository;
		this.leadRepository = leadRepository;
		this.leadActivityRepository = leadActivityRepository;
		this.userRepository = userRepository;
		this.siteVisitMapper = siteVisitMapper;
	}

	@Transactional
	public SiteVisitResponse scheduleVisit(Long leadId, Long currentUserId, boolean admin,
			CreateSiteVisitRequest request) {

		Lead lead = getLead(leadId);

		validateAccess(lead, currentUserId, admin);

		if (lead.getStage() != LeadStage.QUALIFIED && lead.getStage() != LeadStage.FOLLOW_UP) {

			throw new ConflictException("Site visit can only be scheduled for a QUALIFIED or FOLLOW_UP lead");
		}

		if (siteVisitRepository.existsByLeadIdAndStatus(leadId, SiteVisitStatus.SCHEDULED)) {

			throw new ConflictException("Lead already has a scheduled site visit");
		}

		User performedBy = userRepository.findById(currentUserId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		SiteVisit visit = new SiteVisit();

		visit.setLead(lead);
		visit.setScheduledBy(performedBy);
		visit.setScheduledAt(request.scheduledAt());
		visit.setStatus(SiteVisitStatus.SCHEDULED);

		SiteVisit savedVisit = siteVisitRepository.save(visit);

		LeadStage oldStage = lead.getStage();

		lead.setStage(LeadStage.VISIT_SCHEDULED);

		leadRepository.save(lead);

		LeadActivity activity = new LeadActivity();

		activity.setLead(lead);
		activity.setPerformedBy(performedBy);
		activity.setActivityType(LeadActivityType.VISIT_SCHEDULED);

		activity.setDescription("Site visit scheduled for " + request.scheduledAt());

		activity.setOldStage(oldStage);
		activity.setNewStage(LeadStage.VISIT_SCHEDULED);

		leadActivityRepository.save(activity);

		return siteVisitMapper.toResponse(savedVisit);
	}

	@Transactional(readOnly = true)
	public List<SiteVisitResponse> getVisits(Long leadId, Long currentUserId, boolean admin) {

		Lead lead = getLead(leadId);

		validateAccess(lead, currentUserId, admin);

		return siteVisitRepository.findByLeadIdOrderByScheduledAtDesc(leadId).stream().map(siteVisitMapper::toResponse)
				.toList();
	}

	private Lead getLead(Long leadId) {

		return leadRepository.findById(leadId).orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
	}

	private void validateAccess(Lead lead, Long currentUserId, boolean admin) {

		if (admin) {
			return;
		}

		if (lead.getAssignedAgent() == null || !lead.getAssignedAgent().getId().equals(currentUserId)) {

			throw new AccessDeniedException("You do not have access to this lead");
		}
	}

	@Transactional
	public SiteVisitResponse rescheduleVisit(Long visitId, Long currentUserId, boolean admin,
			RescheduleSiteVisitRequest request) {

		SiteVisit visit = getVisit(visitId);

		Lead lead = visit.getLead();

		validateAccess(lead, currentUserId, admin);

		if (visit.getStatus() != SiteVisitStatus.SCHEDULED) {

			throw new ConflictException("Only a scheduled site visit can be rescheduled");
		}

		LocalDateTime oldScheduledAt = visit.getScheduledAt();

		visit.setScheduledAt(request.scheduledAt());

		SiteVisit savedVisit = siteVisitRepository.save(visit);

		User performedBy = getUser(currentUserId);

		LeadActivity activity = new LeadActivity();

		activity.setLead(lead);
		activity.setPerformedBy(performedBy);
		activity.setActivityType(LeadActivityType.VISIT_UPDATED);

		activity.setDescription("Site visit rescheduled from " + oldScheduledAt + " to " + request.scheduledAt());

		activity.setOldStage(lead.getStage());
		activity.setNewStage(lead.getStage());

		leadActivityRepository.save(activity);

		return siteVisitMapper.toResponse(savedVisit);
	}

	@Transactional
	public SiteVisitResponse updateVisitStatus(Long visitId, Long currentUserId, boolean admin,
			UpdateSiteVisitStatusRequest request) {

		SiteVisit visit = getVisit(visitId);

		Lead lead = visit.getLead();

		validateAccess(lead, currentUserId, admin);

		if (visit.getStatus() != SiteVisitStatus.SCHEDULED) {

			throw new ConflictException("Only a scheduled site visit can be updated");
		}

		SiteVisitStatus newStatus = request.status();

		if (newStatus == SiteVisitStatus.SCHEDULED) {

			throw new ConflictException("Use the reschedule endpoint to update a scheduled visit");
		}

		User performedBy = getUser(currentUserId);

		LeadStage oldLeadStage = lead.getStage();

		if (lead.getStage() != LeadStage.VISIT_SCHEDULED) {

			throw new ConflictException("Lead is not currently in VISIT_SCHEDULED stage");
		}

		switch (newStatus) {

		case COMPLETED -> {

			visit.setStatus(SiteVisitStatus.COMPLETED);

			visit.setCompletedAt(LocalDateTime.now());

			visit.setFeedback(normalizeFeedback(request.feedback()));

			lead.setStage(LeadStage.VISIT_COMPLETED);
		}

		case CANCELLED -> {

			visit.setStatus(SiteVisitStatus.CANCELLED);

			visit.setCompletedAt(null);

			visit.setFeedback(normalizeFeedback(request.feedback()));

			lead.setStage(LeadStage.FOLLOW_UP);
		}

		case NO_SHOW -> {

			visit.setStatus(SiteVisitStatus.NO_SHOW);

			visit.setCompletedAt(null);

			visit.setFeedback(normalizeFeedback(request.feedback()));

			lead.setStage(LeadStage.FOLLOW_UP);
		}

		default -> throw new ConflictException("Unsupported site visit status");
		}

		SiteVisit savedVisit = siteVisitRepository.save(visit);

		leadRepository.save(lead);

		LeadActivity activity = new LeadActivity();

		activity.setLead(lead);
		activity.setPerformedBy(performedBy);
		activity.setActivityType(LeadActivityType.VISIT_UPDATED);

		activity.setDescription("Site visit status changed to " + newStatus);

		activity.setOldStage(oldLeadStage);
		activity.setNewStage(lead.getStage());

		leadActivityRepository.save(activity);

		return siteVisitMapper.toResponse(savedVisit);
	}

	private SiteVisit getVisit(Long visitId) {

		return siteVisitRepository.findById(visitId)
				.orElseThrow(() -> new ResourceNotFoundException("Site visit not found"));
	}

	private User getUser(Long userId) {

		return userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
	}

	private String normalizeFeedback(String feedback) {

		if (feedback == null) {
			return null;
		}

		String trimmed = feedback.trim();

		return trimmed.isEmpty() ? null : trimmed;
	}
}