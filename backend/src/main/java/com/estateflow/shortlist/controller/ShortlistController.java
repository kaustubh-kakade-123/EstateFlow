package com.estateflow.shortlist.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.estateflow.security.EstateFlowUserPrincipal;
import com.estateflow.shortlist.dto.ShortlistResponse;
import com.estateflow.shortlist.service.ShortlistService;

@RestController
@RequestMapping("/api/v1/shortlists")
@PreAuthorize("hasRole('BUYER')")
public class ShortlistController {

	private final ShortlistService shortlistService;

	public ShortlistController(ShortlistService shortlistService) {

		this.shortlistService = shortlistService;
	}

	@PostMapping("/{propertyId}")
	public ResponseEntity<ShortlistResponse> addToShortlist(@PathVariable Long propertyId,
			@AuthenticationPrincipal EstateFlowUserPrincipal principal) {

		ShortlistResponse response = shortlistService.addToShortlist(principal.getId(), propertyId);

		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@GetMapping("/me")
	public ResponseEntity<List<ShortlistResponse>> getMyShortlist(
			@AuthenticationPrincipal EstateFlowUserPrincipal principal) {

		return ResponseEntity.ok(shortlistService.getMyShortlist(principal.getId()));
	}

	@DeleteMapping("/{propertyId}")
	public ResponseEntity<Void> removeFromShortlist(@PathVariable Long propertyId,
			@AuthenticationPrincipal EstateFlowUserPrincipal principal) {

		shortlistService.removeFromShortlist(principal.getId(), propertyId);

		return ResponseEntity.noContent().build();
	}
}