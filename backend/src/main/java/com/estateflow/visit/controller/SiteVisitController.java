package com.estateflow.visit.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.estateflow.security.EstateFlowUserPrincipal;
import com.estateflow.visit.dto.CreateSiteVisitRequest;
import com.estateflow.visit.dto.SiteVisitResponse;
import com.estateflow.visit.service.SiteVisitService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/leads/{leadId}/site-visits")
@PreAuthorize("hasAnyRole('ADMIN','AGENT')")
public class SiteVisitController {

	private final SiteVisitService siteVisitService;

	public SiteVisitController(SiteVisitService siteVisitService) {

		this.siteVisitService = siteVisitService;
	}

	@PostMapping
	public ResponseEntity<SiteVisitResponse> scheduleVisit(@PathVariable Long leadId,
			@Valid @RequestBody CreateSiteVisitRequest request,
			@AuthenticationPrincipal EstateFlowUserPrincipal principal) {

		SiteVisitResponse response = siteVisitService.scheduleVisit(leadId, principal.getId(), isAdmin(principal),
				request);

		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@GetMapping
	public ResponseEntity<List<SiteVisitResponse>> getVisits(@PathVariable Long leadId,
			@AuthenticationPrincipal EstateFlowUserPrincipal principal) {

		return ResponseEntity.ok(siteVisitService.getVisits(leadId, principal.getId(), isAdmin(principal)));
	}

	private boolean isAdmin(EstateFlowUserPrincipal principal) {

		return principal.getAuthorities().stream().anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
	}
}