package com.estateflow.enquiry.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.estateflow.common.dto.PageResponse;
import com.estateflow.common.exception.ResourceNotFoundException;
import com.estateflow.enquiry.dto.CreateEnquiryRequest;
import com.estateflow.enquiry.dto.EnquiryResponse;
import com.estateflow.enquiry.entity.Enquiry;
import com.estateflow.enquiry.entity.EnquiryStatus;
import com.estateflow.enquiry.repository.EnquiryRepository;
import com.estateflow.lead.entity.Lead;
import com.estateflow.lead.entity.LeadActivity;
import com.estateflow.lead.entity.LeadActivityType;
import com.estateflow.lead.entity.LeadPriority;
import com.estateflow.lead.entity.LeadStage;
import com.estateflow.lead.repository.LeadActivityRepository;
import com.estateflow.lead.repository.LeadRepository;
import com.estateflow.property.entity.Property;
import com.estateflow.property.entity.PropertyStatus;
import com.estateflow.property.repository.PropertyRepository;
import com.estateflow.user.entity.User;
import com.estateflow.user.repository.UserRepository;

@Service
public class EnquiryService {

	private final EnquiryRepository enquiryRepository;
	private final LeadRepository leadRepository;
	private final LeadActivityRepository leadActivityRepository;
	private final PropertyRepository propertyRepository;
	private final UserRepository userRepository;

	public EnquiryService(EnquiryRepository enquiryRepository, LeadRepository leadRepository,
			LeadActivityRepository leadActivityRepository, PropertyRepository propertyRepository,
			UserRepository userRepository) {

		this.enquiryRepository = enquiryRepository;
		this.leadRepository = leadRepository;
		this.leadActivityRepository = leadActivityRepository;
		this.propertyRepository = propertyRepository;
		this.userRepository = userRepository;
	}

	@Transactional
	public EnquiryResponse createEnquiry(Long buyerUserId, Long propertyId, CreateEnquiryRequest request) {

		User buyer = userRepository.findById(buyerUserId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		Property property = propertyRepository.findByIdAndStatusAndVerifiedTrue(propertyId, PropertyStatus.PUBLISHED)
				.orElseThrow(() -> new ResourceNotFoundException("Property not found"));

		Enquiry enquiry = new Enquiry();

		enquiry.setProperty(property);
		enquiry.setBuyer(buyer);
		enquiry.setMessage(normalizeMessage(request.message()));
		enquiry.setSource(request.source());
		enquiry.setStatus(EnquiryStatus.NEW);

		Enquiry savedEnquiry = enquiryRepository.save(enquiry);

		Lead lead = new Lead();

		lead.setEnquiry(savedEnquiry);
		lead.setStage(LeadStage.NEW);
		lead.setPriority(LeadPriority.MEDIUM);

		Lead savedLead = leadRepository.save(lead);

		LeadActivity activity = new LeadActivity();

		activity.setLead(savedLead);
		activity.setPerformedBy(buyer);
		activity.setActivityType(LeadActivityType.CREATED);
		activity.setDescription("Lead created from property enquiry");
		activity.setOldStage(null);
		activity.setNewStage(LeadStage.NEW);

		leadActivityRepository.save(activity);

		return new EnquiryResponse(savedEnquiry.getId(), property.getId(), buyer.getId(), savedEnquiry.getMessage(),
				savedEnquiry.getSource(), savedEnquiry.getStatus(), savedLead.getId(), savedLead.getStage(),
				savedLead.getPriority(), savedEnquiry.getCreatedAt());
	}

	private String normalizeMessage(String message) {

		if (message == null) {
			return null;
		}

		String trimmed = message.trim();

		return trimmed.isEmpty() ? null : trimmed;
	}

	@Transactional(readOnly = true)
	public PageResponse<EnquiryResponse> getBuyerEnquiries(Long buyerUserId, Pageable pageable) {

		Page<Enquiry> page = enquiryRepository.findByBuyerId(buyerUserId, pageable);

		Page<EnquiryResponse> responsePage = page.map(enquiry -> {

			Lead lead = leadRepository.findByEnquiryId(enquiry.getId()).orElse(null);

			return new EnquiryResponse(enquiry.getId(), enquiry.getProperty().getId(), enquiry.getBuyer().getId(),
					enquiry.getMessage(), enquiry.getSource(), enquiry.getStatus(),

					lead != null ? lead.getId() : null,

					lead != null ? lead.getStage() : null,

					lead != null ? lead.getPriority() : null,

					enquiry.getCreatedAt());
		});

		return new PageResponse<>(responsePage.getContent(), responsePage.getNumber(), responsePage.getSize(),
				responsePage.getTotalElements(), responsePage.getTotalPages(), responsePage.isFirst(),
				responsePage.isLast());
	}
}