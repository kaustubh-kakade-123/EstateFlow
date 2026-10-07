package com.estateflow.visit.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

public record CreateSiteVisitRequest(

		@NotNull @Future LocalDateTime scheduledAt

) {
}