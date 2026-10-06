package com.estateflow.shortlist.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.estateflow.common.exception.ConflictException;
import com.estateflow.common.exception.ResourceNotFoundException;
import com.estateflow.property.entity.Property;
import com.estateflow.property.entity.PropertyStatus;
import com.estateflow.property.mapper.PropertyMapper;
import com.estateflow.property.repository.PropertyRepository;
import com.estateflow.shortlist.dto.ShortlistResponse;
import com.estateflow.shortlist.entity.Shortlist;
import com.estateflow.shortlist.repository.ShortlistRepository;
import com.estateflow.user.entity.User;
import com.estateflow.user.repository.UserRepository;

@Service
public class ShortlistService {

	private final ShortlistRepository shortlistRepository;
	private final PropertyRepository propertyRepository;
	private final UserRepository userRepository;
	private final PropertyMapper propertyMapper;

	public ShortlistService(ShortlistRepository shortlistRepository, PropertyRepository propertyRepository,
			UserRepository userRepository, PropertyMapper propertyMapper) {

		this.shortlistRepository = shortlistRepository;
		this.propertyRepository = propertyRepository;
		this.userRepository = userRepository;
		this.propertyMapper = propertyMapper;
	}

	@Transactional
	public ShortlistResponse addToShortlist(Long userId, Long propertyId) {

		User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

		Property property = propertyRepository.findByIdAndStatusAndVerifiedTrue(propertyId, PropertyStatus.PUBLISHED)
				.orElseThrow(() -> new ResourceNotFoundException("Property not found"));

		if (shortlistRepository.existsByUserIdAndPropertyId(userId, propertyId)) {

			throw new ConflictException("Property is already shortlisted");
		}

		Shortlist shortlist = new Shortlist();
		shortlist.setUser(user);
		shortlist.setProperty(property);

		Shortlist saved = shortlistRepository.save(shortlist);

		return toResponse(saved);
	}

	@Transactional(readOnly = true)
	public List<ShortlistResponse> getMyShortlist(Long userId) {

		return shortlistRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toResponse).toList();
	}

	@Transactional
	public void removeFromShortlist(Long userId, Long propertyId) {

		if (!shortlistRepository.existsByUserIdAndPropertyId(userId, propertyId)) {

			throw new ResourceNotFoundException("Shortlisted property not found");
		}

		shortlistRepository.deleteByUserIdAndPropertyId(userId, propertyId);
	}

	private ShortlistResponse toResponse(Shortlist shortlist) {

		return new ShortlistResponse(shortlist.getId(), propertyMapper.toResponse(shortlist.getProperty()),
				shortlist.getCreatedAt());
	}
}