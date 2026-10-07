package com.estateflow.lead.dto;

import jakarta.validation.constraints.NotNull;

public record AssignLeadRequest(

		@NotNull Long agentUserId

) {
}