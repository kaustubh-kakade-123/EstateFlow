package com.estateflow.followup.dto;

import java.time.LocalDateTime;

import com.estateflow.followup.entity.FollowUpStatus;

public record FollowUpResponse(

		Long id, Long leadId,

		Long assignedToUserId, String assignedToName,

		LocalDateTime scheduledAt, FollowUpStatus status,

		String note, LocalDateTime completedAt,

		LocalDateTime createdAt, LocalDateTime updatedAt

) {
}