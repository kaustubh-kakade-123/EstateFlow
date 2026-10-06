package com.estateflow.lead.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.estateflow.lead.dto.AssignLeadRequest;
import com.estateflow.lead.dto.LeadResponse;
import com.estateflow.lead.dto.UpdateLeadStageRequest;
import com.estateflow.lead.service.LeadService;
import com.estateflow.security.EstateFlowUserPrincipal;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/leads")
@PreAuthorize("hasAnyRole('ADMIN','AGENT')")
public class LeadController {

	private final LeadService leadService;

	public LeadController(LeadService leadService) {
		this.leadService = leadService;
	}

	@GetMapping
	public ResponseEntity<List<LeadResponse>> getLeads(@AuthenticationPrincipal EstateFlowUserPrincipal principal) {

		boolean admin = principal.getAuthorities().stream()
				.anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));

		if (admin) {
			return ResponseEntity.ok(leadService.getAllLeads());
		}

		return ResponseEntity.ok(leadService.getAssignedLeads(principal.getId()));
	}

	@GetMapping("/{leadId}")
	public ResponseEntity<LeadResponse> getLead(@PathVariable Long leadId,
			@AuthenticationPrincipal EstateFlowUserPrincipal principal) {

		boolean admin = principal.getAuthorities().stream()
				.anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));

		return ResponseEntity.ok(leadService.getLead(leadId, principal.getId(), admin));
	}

	@PatchMapping("/{leadId}/assign")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<LeadResponse> assignLead(@PathVariable Long leadId,
			@Valid @RequestBody AssignLeadRequest request, @AuthenticationPrincipal EstateFlowUserPrincipal principal) {

		return ResponseEntity.ok(leadService.assignLead(leadId, request.agentUserId(), principal.getId()));
	}

	@PatchMapping("/{leadId}/stage")
	public ResponseEntity<LeadResponse> updateStage(@PathVariable Long leadId,
			@Valid @RequestBody UpdateLeadStageRequest request,
			@AuthenticationPrincipal EstateFlowUserPrincipal principal) {

		boolean admin = principal.getAuthorities().stream()
				.anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));

		return ResponseEntity.ok(leadService.updateStage(leadId, principal.getId(), admin, request));
	}
}