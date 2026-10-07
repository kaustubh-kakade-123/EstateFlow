package com.estateflow.visit.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.estateflow.security.EstateFlowUserPrincipal;
import com.estateflow.visit.dto.RescheduleSiteVisitRequest;
import com.estateflow.visit.dto.SiteVisitResponse;
import com.estateflow.visit.dto.UpdateSiteVisitStatusRequest;
import com.estateflow.visit.service.SiteVisitService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/site-visits")
@PreAuthorize("hasAnyRole('ADMIN','AGENT')")
public class SiteVisitManagementController {

	private final SiteVisitService siteVisitService;

	public SiteVisitManagementController(SiteVisitService siteVisitService) {

		this.siteVisitService = siteVisitService;
	}

	@PatchMapping("/{visitId}")
	public ResponseEntity<SiteVisitResponse> rescheduleVisit(

			@PathVariable Long visitId,

			@Valid @RequestBody RescheduleSiteVisitRequest request,

			@AuthenticationPrincipal EstateFlowUserPrincipal principal) {

		return ResponseEntity
				.ok(siteVisitService.rescheduleVisit(visitId, principal.getId(), isAdmin(principal), request));
	}

	@PatchMapping("/{visitId}/status")
	public ResponseEntity<SiteVisitResponse> updateStatus(

			@PathVariable Long visitId,

			@Valid @RequestBody UpdateSiteVisitStatusRequest request,

			@AuthenticationPrincipal EstateFlowUserPrincipal principal) {

		return ResponseEntity
				.ok(siteVisitService.updateVisitStatus(visitId, principal.getId(), isAdmin(principal), request));
	}

	private boolean isAdmin(EstateFlowUserPrincipal principal) {

		return principal.getAuthorities().stream().anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
	}
}