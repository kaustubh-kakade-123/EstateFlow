package com.estateflow.property.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.estateflow.common.exception.ResourceNotFoundException;
import com.estateflow.property.service.PropertyImageStorageService;

@RestController
@RequestMapping("/api/v1/property-images/files")
public class PropertyImageFileController {

	private final PropertyImageStorageService storageService;

	public PropertyImageFileController(PropertyImageStorageService storageService) {
		this.storageService = storageService;
	}

	@GetMapping("/{filename:.+}")
	public ResponseEntity<Resource> getImage(@PathVariable String filename) throws IOException {

		Path path = storageService.resolve(filename);

		if (!Files.isRegularFile(path)) {
			throw new ResourceNotFoundException("Image not found");
		}

		Resource resource = new UrlResource(path.toUri());

		MediaType mediaType;

		if (filename.endsWith(".png")) {
			mediaType = MediaType.IMAGE_PNG;
		} else if (filename.endsWith(".webp")) {
			mediaType = MediaType.parseMediaType("image/webp");
		} else {
			mediaType = MediaType.IMAGE_JPEG;
		}

		return ResponseEntity.ok().contentType(mediaType).header("X-Content-Type-Options", "nosniff").body(resource);
	}
}
