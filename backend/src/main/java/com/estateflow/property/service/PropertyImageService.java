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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
public class PropertyImageService {

	private final PropertyRepository propertyRepository;
	private final PropertyImageRepository imageRepository;
	private final PropertyImageStorageService storageService;

	public PropertyImageService(PropertyRepository propertyRepository, PropertyImageRepository imageRepository,
			PropertyImageStorageService storageService) {

		this.propertyRepository = propertyRepository;
		this.imageRepository = imageRepository;
		this.storageService = storageService;
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

		String imageUrl = image.getImageUrl();

		boolean wasPrimary = image.isPrimary();

		if (wasPrimary) {
			List<PropertyImage> remainingImages = imageRepository.findByPropertyIdOrderByDisplayOrderAsc(propertyId)
					.stream().filter(existing -> !existing.getId().equals(imageId)).toList();

			if (!remainingImages.isEmpty()) {
				PropertyImage replacement = remainingImages.get(0);
				replacement.setPrimary(true);
				imageRepository.save(replacement);
			}
		}

		imageRepository.delete(image);

		if (TransactionSynchronizationManager.isSynchronizationActive()) {
			TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
				@Override
				public void afterCommit() {
					storageService.deleteStoredFile(imageUrl);
				}
			});
		}

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

	@Transactional
	public PropertyImageResponse uploadImage(Long propertyId, Long currentUserId, MultipartFile file) {

		Property property = getProperty(propertyId);
		validateOwnership(property, currentUserId);

		// Storage occurs only after ownership has been verified.
		String imageUrl = storageService.store(file);

		try {
			// Reuse existing primary-image and ordering behavior.
			AddPropertyImageRequest request = new AddPropertyImageRequest(imageUrl, 0, false);

			PropertyImageResponse response = addImage(propertyId, currentUserId, request);

			// Clean up the file if the database transaction rolls back.
			TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
				@Override
				public void afterCompletion(int status) {
					if (status != TransactionSynchronization.STATUS_COMMITTED) {
						storageService.deleteStoredFile(imageUrl);
					}
				}
			});

			return response;

		} catch (RuntimeException ex) {
			storageService.deleteStoredFile(imageUrl);
			throw ex;
		}
	}

	@Transactional(readOnly = true)
	public List<PropertyImageResponse> getOwnerImages(Long propertyId, Long currentUserId) {

		Property property = getProperty(propertyId);
		validateOwnership(property, currentUserId);

		return imageRepository.findByPropertyIdOrderByDisplayOrderAsc(propertyId).stream().map(this::toResponse)
				.toList();
	}

	@Transactional
	public PropertyImageResponse setPrimaryImage(Long propertyId, Long imageId, Long currentUserId) {

		Property property = getProperty(propertyId);
		validateOwnership(property, currentUserId);

		List<PropertyImage> images = imageRepository.findByPropertyIdOrderByDisplayOrderAsc(propertyId);

		PropertyImage selected = images.stream().filter(image -> image.getId().equals(imageId)).findFirst()
				.orElseThrow(() -> new ResourceNotFoundException("Property image not found"));

		for (PropertyImage image : images) {
			image.setPrimary(image.getId().equals(imageId));
		}

		imageRepository.saveAll(images);

		return toResponse(selected);
	}

}
