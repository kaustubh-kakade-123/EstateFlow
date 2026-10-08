package com.estateflow.property.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.estateflow.property.dto.PropertyResponse;
import com.estateflow.property.service.PropertyService;

@RestController
@RequestMapping("/api/v1/admin/properties")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPropertyController {

	private final PropertyService propertyService;

	public AdminPropertyController(PropertyService propertyService) {
		this.propertyService = propertyService;
	}

	@PatchMapping("/{propertyId}/approve")
	public ResponseEntity<PropertyResponse> approveProperty(@PathVariable Long propertyId) {

		return ResponseEntity.ok(propertyService.approveProperty(propertyId));
	}

	@PatchMapping("/{propertyId}/reject")
	public ResponseEntity<PropertyResponse> rejectProperty(@PathVariable Long propertyId) {

		return ResponseEntity.ok(propertyService.rejectProperty(propertyId));
	}

	@GetMapping("/pending")
	public ResponseEntity<List<PropertyResponse>> getPendingProperties() {
		return ResponseEntity.ok(propertyService.getPendingProperties());
	}
}