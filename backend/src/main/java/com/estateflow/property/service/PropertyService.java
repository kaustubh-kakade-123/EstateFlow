package com.estateflow.property.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.estateflow.common.exception.ResourceNotFoundException;
import com.estateflow.property.dto.CreatePropertyRequest;
import com.estateflow.property.dto.PropertyResponse;
import com.estateflow.property.entity.Property;
import com.estateflow.property.entity.PropertyStatus;
import com.estateflow.property.mapper.PropertyMapper;
import com.estateflow.property.repository.PropertyRepository;
import com.estateflow.security.EstateFlowUserPrincipal;
import com.estateflow.user.entity.User;
import com.estateflow.user.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;

import com.estateflow.common.exception.BadRequestException;
import com.estateflow.common.exception.ConflictException;
import com.estateflow.property.dto.UpdatePropertyRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.estateflow.property.dto.PropertySearchCriteria;
import com.estateflow.property.specification.PropertySpecification;

@Service
public class PropertyService {

	private final PropertyRepository propertyRepository;
	private final UserRepository userRepository;
	private final PropertyMapper propertyMapper;

	public PropertyService(PropertyRepository propertyRepository, UserRepository userRepository,
			PropertyMapper propertyMapper) {

		this.propertyRepository = propertyRepository;
		this.userRepository = userRepository;
		this.propertyMapper = propertyMapper;
	}

	@Transactional
	public PropertyResponse createProperty(CreatePropertyRequest request, EstateFlowUserPrincipal principal) {

		User listedBy = userRepository.findById(principal.getId())
				.orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

		Property property = propertyMapper.toEntity(request);

		property.setListedBy(listedBy);
		property.setStatus(PropertyStatus.DRAFT);
		property.setVerified(false);

		Property savedProperty = propertyRepository.save(property);

		return propertyMapper.toResponse(savedProperty);
	}

	@Transactional(readOnly = true)
	public List<PropertyResponse> getMyProperties(EstateFlowUserPrincipal principal) {

		return propertyRepository.findByListedByIdOrderByCreatedAtDesc(principal.getId()).stream()
				.map(propertyMapper::toResponse).toList();
	}

	@Transactional
	public PropertyResponse updateProperty(Long propertyId, UpdatePropertyRequest request,
			EstateFlowUserPrincipal principal) {

		Property property = propertyRepository.findById(propertyId)
				.orElseThrow(() -> new ResourceNotFoundException("Property not found"));

		if (!property.getListedBy().getId().equals(principal.getId())) {
			throw new AccessDeniedException("You are not allowed to update this property");
		}

		if (property.getStatus() != PropertyStatus.DRAFT && property.getStatus() != PropertyStatus.REJECTED) {

			throw new ConflictException("Only DRAFT or REJECTED properties can be updated");
		}

		propertyMapper.updateEntity(request, property);

		Property savedProperty = propertyRepository.save(property);

		return propertyMapper.toResponse(savedProperty);
	}

	@Transactional
	public PropertyResponse submitProperty(Long propertyId, EstateFlowUserPrincipal principal) {

		Property property = propertyRepository.findById(propertyId)
				.orElseThrow(() -> new ResourceNotFoundException("Property not found"));

		if (!property.getListedBy().getId().equals(principal.getId())) {
			throw new AccessDeniedException("You are not allowed to submit this property");
		}

		if (property.getStatus() != PropertyStatus.DRAFT && property.getStatus() != PropertyStatus.REJECTED) {

			throw new ConflictException("Only DRAFT or REJECTED properties can be submitted");
		}

		property.setStatus(PropertyStatus.PENDING_APPROVAL);

		Property savedProperty = propertyRepository.save(property);

		return propertyMapper.toResponse(savedProperty);
	}

	@Transactional(readOnly = true)
	public List<PropertyResponse> getPendingProperties() {

		return propertyRepository.findByStatusOrderByCreatedAtDesc(PropertyStatus.PENDING_APPROVAL).stream()
				.map(propertyMapper::toResponse).toList();
	}

	@Transactional
	public PropertyResponse approveProperty(Long propertyId) {

		Property property = propertyRepository.findById(propertyId)
				.orElseThrow(() -> new ResourceNotFoundException("Property not found"));

		if (property.getStatus() != PropertyStatus.PENDING_APPROVAL) {
			throw new ConflictException("Only PENDING_APPROVAL properties can be approved");
		}

		property.setStatus(PropertyStatus.PUBLISHED);
		property.setVerified(true);

		Property savedProperty = propertyRepository.save(property);

		return propertyMapper.toResponse(savedProperty);
	}

	@Transactional
	public PropertyResponse rejectProperty(Long propertyId) {

		Property property = propertyRepository.findById(propertyId)
				.orElseThrow(() -> new ResourceNotFoundException("Property not found"));

		if (property.getStatus() != PropertyStatus.PENDING_APPROVAL) {
			throw new ConflictException("Only PENDING_APPROVAL properties can be rejected");
		}

		property.setStatus(PropertyStatus.REJECTED);
		property.setVerified(false);

		Property savedProperty = propertyRepository.save(property);

		return propertyMapper.toResponse(savedProperty);
	}

	@Transactional(readOnly = true)
	public PropertyResponse getPublishedProperty(Long propertyId) {

		Property property = propertyRepository.findByIdAndStatusAndVerifiedTrue(propertyId, PropertyStatus.PUBLISHED)
				.orElseThrow(() -> new ResourceNotFoundException("Property not found"));

		return propertyMapper.toResponse(property);
	}

	@Transactional(readOnly = true)
	public Page<PropertyResponse> searchProperties(PropertySearchCriteria criteria, Pageable pageable) {
		if (criteria.minPrice() != null && criteria.maxPrice() != null
				&& criteria.minPrice().compareTo(criteria.maxPrice()) > 0) {

			throw new BadRequestException("minPrice must be less than or equal to maxPrice");
		}
		return propertyRepository.findAll(PropertySpecification.withFilters(criteria), pageable)
				.map(propertyMapper::toResponse);
	}
}