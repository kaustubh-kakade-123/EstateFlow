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
}