package com.estateflow.enquiry.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.estateflow.common.dto.PageResponse;
import com.estateflow.enquiry.dto.EnquiryResponse;
import com.estateflow.enquiry.service.EnquiryService;
import com.estateflow.security.EstateFlowUserPrincipal;

@RestController
@RequestMapping("/api/v1/enquiries")
public class BuyerEnquiryController {

	private final EnquiryService enquiryService;

	public BuyerEnquiryController(EnquiryService enquiryService) {

		this.enquiryService = enquiryService;
	}

	@GetMapping("/me")
	@PreAuthorize("hasRole('BUYER')")
	public ResponseEntity<PageResponse<EnquiryResponse>> getMyEnquiries(

			@PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,

			@AuthenticationPrincipal EstateFlowUserPrincipal principal) {

		return ResponseEntity.ok(enquiryService.getBuyerEnquiries(principal.getId(), pageable));
	}
}