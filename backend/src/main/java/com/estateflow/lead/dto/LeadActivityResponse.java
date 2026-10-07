package com.estateflow.lead.dto;

import java.time.LocalDateTime;

import com.estateflow.lead.entity.LeadActivityType;
import com.estateflow.lead.entity.LeadStage;

public record LeadActivityResponse(

		Long id, Long leadId,

		Long performedByUserId, String performedByName,

		LeadActivityType activityType, String description,

		LeadStage oldStage, LeadStage newStage,

		LocalDateTime createdAt

) {
}