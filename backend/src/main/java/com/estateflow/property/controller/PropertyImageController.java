package com.estateflow.property.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.estateflow.property.dto.AddPropertyImageRequest;
import com.estateflow.property.dto.PropertyImageResponse;
import com.estateflow.property.service.PropertyImageService;
import com.estateflow.security.EstateFlowUserPrincipal;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/properties/{propertyId}/images")
public class PropertyImageController {

	private final PropertyImageService imageService;

	public PropertyImageController(PropertyImageService imageService) {

		this.imageService = imageService;
	}

	@PostMapping
	@PreAuthorize("hasAnyRole('OWNER','BUILDER')")
	public ResponseEntity<PropertyImageResponse> addImage(

			@PathVariable Long propertyId,

			@Valid @RequestBody AddPropertyImageRequest request,

			@AuthenticationPrincipal EstateFlowUserPrincipal principal) {

		return ResponseEntity.status(HttpStatus.CREATED)
				.body(imageService.addImage(propertyId, principal.getId(), request));
	}

	@GetMapping
	public ResponseEntity<List<PropertyImageResponse>> getImages(@PathVariable Long propertyId) {

		return ResponseEntity.ok(imageService.getImages(propertyId));
	}

	@DeleteMapping("/{imageId}")
	@PreAuthorize("hasAnyRole('OWNER','BUILDER')")
	public ResponseEntity<Void> deleteImage(

			@PathVariable Long propertyId, @PathVariable Long imageId,

			@AuthenticationPrincipal EstateFlowUserPrincipal principal) {

		imageService.deleteImage(propertyId, imageId, principal.getId());

		return ResponseEntity.noContent().build();
	}
}
