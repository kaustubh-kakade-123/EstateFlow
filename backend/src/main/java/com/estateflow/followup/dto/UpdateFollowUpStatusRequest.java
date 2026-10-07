package com.estateflow.followup.dto;

import com.estateflow.followup.entity.FollowUpStatus;

import jakarta.validation.constraints.NotNull;

public record UpdateFollowUpStatusRequest(

		@NotNull FollowUpStatus status

) {
}