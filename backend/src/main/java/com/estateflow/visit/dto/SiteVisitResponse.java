package com.estateflow.visit.dto;

import java.time.LocalDateTime;

import com.estateflow.visit.entity.SiteVisitStatus;

public record SiteVisitResponse(

		Long id, Long leadId,

		Long scheduledByUserId, String scheduledByName,

		LocalDateTime scheduledAt, SiteVisitStatus status,

		String feedback, LocalDateTime completedAt,

		LocalDateTime createdAt, LocalDateTime updatedAt

) {
}