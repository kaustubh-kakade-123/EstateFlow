package com.estateflow.visit.mapper;

import org.springframework.stereotype.Component;

import com.estateflow.visit.dto.SiteVisitResponse;
import com.estateflow.visit.entity.SiteVisit;

@Component
public class SiteVisitMapper {

	public SiteVisitResponse toResponse(SiteVisit visit) {

		return new SiteVisitResponse(visit.getId(), visit.getLead().getId(),

				visit.getScheduledBy().getId(), visit.getScheduledBy().getFullName(),

				visit.getScheduledAt(), visit.getStatus(),

				visit.getFeedback(), visit.getCompletedAt(),

				visit.getCreatedAt(), visit.getUpdatedAt());
	}
}