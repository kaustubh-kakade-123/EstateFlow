package com.estateflow.visit.dto;

import com.estateflow.visit.entity.SiteVisitStatus;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateSiteVisitStatusRequest(

		@NotNull SiteVisitStatus status,

		@Size(max = 2000) String feedback

) {
}