package com.estateflow.followup.mapper;

import org.springframework.stereotype.Component;

import com.estateflow.followup.dto.FollowUpResponse;
import com.estateflow.followup.entity.FollowUp;

@Component
public class FollowUpMapper {

	public FollowUpResponse toResponse(FollowUp followUp) {

		return new FollowUpResponse(followUp.getId(), followUp.getLead().getId(),

				followUp.getAssignedTo().getId(), followUp.getAssignedTo().getFullName(),

				followUp.getScheduledAt(), followUp.getStatus(),

				followUp.getNote(), followUp.getCompletedAt(),

				followUp.getCreatedAt(), followUp.getUpdatedAt());
	}
}