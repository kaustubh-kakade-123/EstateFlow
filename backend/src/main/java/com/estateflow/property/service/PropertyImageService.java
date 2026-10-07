package com.estateflow.property.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.estateflow.common.exception.ResourceNotFoundException;
import com.estateflow.property.dto.AddPropertyImageRequest;
import com.estateflow.property.dto.PropertyImageResponse;
import com.estateflow.property.entity.Property;
import com.estateflow.property.entity.PropertyImage;
import com.estateflow.property.entity.PropertyStatus;
import com.estateflow.property.repository.PropertyImageRepository;
import com.estateflow.property.repository.PropertyRepository;

@Service
public class PropertyImageService {

	private final PropertyRepository propertyRepository;
	private final PropertyImageRepository imageRepository;

	public PropertyImageService(PropertyRepository propertyRepository, PropertyImageRepository imageRepository) {

		this.propertyRepository = propertyRepository;
		this.imageRepository = imageRepository;
	}

	@Transactional
	public PropertyImageResponse addImage(Long propertyId, Long currentUserId, AddPropertyImageRequest request) {

		Property property = getProperty(propertyId);

		validateOwnership(property, currentUserId);

		PropertyImage image = new PropertyImage();

		image.setProperty(property);
		image.setImageUrl(request.imageUrl().trim());

		image.setDisplayOrder(request.displayOrder() != null ? request.displayOrder() : 0);

		/*
		 * First image automatically becomes primary.
		 */
		boolean hasPrimary = imageRepository.existsByPropertyIdAndPrimaryTrue(propertyId);

		image.setPrimary(request.primary() || !hasPrimary);

		/*
		 * If this image is explicitly made primary, we'll handle previous primary
		 * below.
		 */
		if (image.isPrimary() && hasPrimary) {

			List<PropertyImage> images = imageRepository.findByPropertyIdOrderByDisplayOrderAsc(propertyId);

			images.stream().filter(PropertyImage::isPrimary).forEach(existing -> existing.setPrimary(false));

			imageRepository.saveAll(images);
		}

		PropertyImage saved = imageRepository.save(image);

		return toResponse(saved);
	}

	@Transactional(readOnly = true)
	public List<PropertyImageResponse> getImages(Long propertyId) {

		propertyRepository.findByIdAndStatusAndVerifiedTrue(propertyId, PropertyStatus.PUBLISHED)
				.orElseThrow(() -> new ResourceNotFoundException("Property not found"));

		return imageRepository.findByPropertyIdOrderByDisplayOrderAsc(propertyId).stream().map(this::toResponse)
				.toList();
	}

	@Transactional
	public void deleteImage(Long propertyId, Long imageId, Long currentUserId) {

		Property property = getProperty(propertyId);

		validateOwnership(property, currentUserId);

		PropertyImage image = imageRepository.findById(imageId)
				.orElseThrow(() -> new ResourceNotFoundException("Property image not found"));

		if (!image.getProperty().getId().equals(propertyId)) {

			throw new ResourceNotFoundException("Property image not found");
		}

		imageRepository.delete(image);
	}

	private Property getProperty(Long propertyId) {

		return propertyRepository.findById(propertyId)
				.orElseThrow(() -> new ResourceNotFoundException("Property not found"));
	}

	private void validateOwnership(Property property, Long currentUserId) {

		if (!property.getListedBy().getId().equals(currentUserId)) {

			throw new AccessDeniedException("You do not own this property");
		}
	}

	private PropertyImageResponse toResponse(PropertyImage image) {

		return new PropertyImageResponse(image.getId(), image.getProperty().getId(), image.getImageUrl(),
				image.getDisplayOrder(), image.isPrimary(), image.getCreatedAt());
	}
}
