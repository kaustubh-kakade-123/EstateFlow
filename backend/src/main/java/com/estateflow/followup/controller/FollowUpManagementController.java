package com.estateflow.followup.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.estateflow.followup.dto.FollowUpResponse;
import com.estateflow.followup.dto.UpdateFollowUpStatusRequest;
import com.estateflow.followup.service.FollowUpService;
import com.estateflow.security.EstateFlowUserPrincipal;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/follow-ups")
@PreAuthorize("hasAnyRole('ADMIN','AGENT')")
public class FollowUpManagementController {

	private final FollowUpService followUpService;

	public FollowUpManagementController(FollowUpService followUpService) {

		this.followUpService = followUpService;
	}

	@PatchMapping("/{followUpId}/status")
	public ResponseEntity<FollowUpResponse> updateStatus(

			@PathVariable Long followUpId,

			@Valid @RequestBody UpdateFollowUpStatusRequest request,

			@AuthenticationPrincipal EstateFlowUserPrincipal principal) {

		return ResponseEntity
				.ok(followUpService.updateStatus(followUpId, principal.getId(), isAdmin(principal), request));
	}

	private boolean isAdmin(EstateFlowUserPrincipal principal) {

		return principal.getAuthorities().stream().anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
	}
}