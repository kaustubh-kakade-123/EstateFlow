package com.estateflow.followup.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateFollowUpRequest(

		@NotNull @Future LocalDateTime scheduledAt,

		@Size(max = 2000) String note

) {
}