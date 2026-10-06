package com.estateflow.property.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.estateflow.common.dto.PageResponse;
import com.estateflow.property.dto.CreatePropertyRequest;
import com.estateflow.property.dto.PropertyResponse;
import com.estateflow.property.dto.UpdatePropertyRequest;
import com.estateflow.property.service.PropertyService;
import com.estateflow.security.EstateFlowUserPrincipal;

import jakarta.validation.Valid;
import java.math.BigDecimal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.RequestParam;

import com.estateflow.property.dto.PropertySearchCriteria;
import com.estateflow.property.entity.ListingType;
import com.estateflow.property.entity.PropertyType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/v1/properties")
public class PropertyController {

	private final PropertyService propertyService;

	public PropertyController(PropertyService propertyService) {
		this.propertyService = propertyService;
	}

	@PostMapping
	@PreAuthorize("hasAnyRole('OWNER', 'BUILDER')")
	public ResponseEntity<PropertyResponse> createProperty(@Valid @RequestBody CreatePropertyRequest request,
			@AuthenticationPrincipal EstateFlowUserPrincipal principal) {

		PropertyResponse response = propertyService.createProperty(request, principal);

		URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(response.id())
				.toUri();

		return ResponseEntity.created(location).body(response);
	}

	@GetMapping("/me")
	@PreAuthorize("hasAnyRole('OWNER', 'BUILDER')")
	public ResponseEntity<List<PropertyResponse>> getMyProperties(
			@AuthenticationPrincipal EstateFlowUserPrincipal principal) {

		return ResponseEntity.ok(propertyService.getMyProperties(principal));
	}

	@PutMapping("/{propertyId}")
	@PreAuthorize("hasAnyRole('OWNER', 'BUILDER')")
	public ResponseEntity<PropertyResponse> updateProperty(@PathVariable Long propertyId,
			@Valid @RequestBody UpdatePropertyRequest request,
			@AuthenticationPrincipal EstateFlowUserPrincipal principal) {

		return ResponseEntity.ok(propertyService.updateProperty(propertyId, request, principal));
	}

	@PatchMapping("/{propertyId}/submit")
	@PreAuthorize("hasAnyRole('OWNER', 'BUILDER')")
	public ResponseEntity<PropertyResponse> submitProperty(@PathVariable Long propertyId,
			@AuthenticationPrincipal EstateFlowUserPrincipal principal) {

		return ResponseEntity.ok(propertyService.submitProperty(propertyId, principal));
	}

	@GetMapping("/{propertyId}")
	public ResponseEntity<PropertyResponse> getProperty(@PathVariable Long propertyId) {

		return ResponseEntity.ok(propertyService.getPublishedProperty(propertyId));
	}

	@GetMapping
	public ResponseEntity<PageResponse<PropertyResponse>> searchProperties(
			@RequestParam(required = false) @Size(max = 120) String city,
			@RequestParam(required = false) @Size(max = 120) String locality,
			@RequestParam(required = false) PropertyType propertyType,
			@RequestParam(required = false) ListingType listingType,
			@RequestParam(required = false) @DecimalMin(value = "0.0", inclusive = true) BigDecimal minPrice,
			@RequestParam(required = false) @DecimalMin(value = "0.0", inclusive = true) BigDecimal maxPrice,
			@RequestParam(required = false) @Min(0) Integer bedrooms,
			@PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

		PropertySearchCriteria criteria = new PropertySearchCriteria(city, locality, propertyType, listingType,
				minPrice, maxPrice, bedrooms);

		Page<PropertyResponse> result = propertyService.searchProperties(criteria, pageable);

		return ResponseEntity.ok(PageResponse.from(result));
	}
}