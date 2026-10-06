package com.estateflow.enquiry.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.estateflow.enquiry.dto.CreateEnquiryRequest;
import com.estateflow.enquiry.dto.EnquiryResponse;
import com.estateflow.enquiry.service.EnquiryService;
import com.estateflow.security.EstateFlowUserPrincipal;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/properties/{propertyId}/enquiries")
public class EnquiryController {

	private final EnquiryService enquiryService;

	public EnquiryController(EnquiryService enquiryService) {

		this.enquiryService = enquiryService;
	}

	@PostMapping
	@PreAuthorize("hasRole('BUYER')")
	public ResponseEntity<EnquiryResponse> createEnquiry(@PathVariable Long propertyId,
			@Valid @RequestBody CreateEnquiryRequest request,
			@AuthenticationPrincipal EstateFlowUserPrincipal principal) {

		EnquiryResponse response = enquiryService.createEnquiry(principal.getId(), propertyId, request);

		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}
}