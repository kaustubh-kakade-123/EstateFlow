package com.estateflow.lead.dto;

import com.estateflow.lead.entity.LeadStage;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateLeadStageRequest(

		@NotNull LeadStage stage,

		@Size(max = 255) String lostReason

) {
}