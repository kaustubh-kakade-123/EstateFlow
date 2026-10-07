package com.estateflow.followup.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.estateflow.followup.dto.CreateFollowUpRequest;
import com.estateflow.followup.dto.FollowUpResponse;
import com.estateflow.followup.service.FollowUpService;
import com.estateflow.security.EstateFlowUserPrincipal;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/leads/{leadId}/follow-ups")
@PreAuthorize("hasAnyRole('ADMIN','AGENT')")
public class FollowUpController {

	private final FollowUpService followUpService;

	public FollowUpController(FollowUpService followUpService) {

		this.followUpService = followUpService;
	}

	@PostMapping
	public ResponseEntity<FollowUpResponse> createFollowUp(

			@PathVariable Long leadId,

			@Valid @RequestBody CreateFollowUpRequest request,

			@AuthenticationPrincipal EstateFlowUserPrincipal principal) {

		FollowUpResponse response = followUpService.createFollowUp(leadId, principal.getId(), isAdmin(principal),
				request);

		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@GetMapping
	public ResponseEntity<List<FollowUpResponse>> getFollowUps(

			@PathVariable Long leadId,

			@AuthenticationPrincipal EstateFlowUserPrincipal principal) {

		return ResponseEntity.ok(followUpService.getFollowUps(leadId, principal.getId(), isAdmin(principal)));
	}

	private boolean isAdmin(EstateFlowUserPrincipal principal) {

		return principal.getAuthorities().stream().anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
	}
}