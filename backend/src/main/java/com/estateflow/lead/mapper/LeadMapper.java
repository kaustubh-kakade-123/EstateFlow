package com.estateflow.lead.mapper;

import org.springframework.stereotype.Component;

import com.estateflow.enquiry.entity.Enquiry;
import com.estateflow.lead.dto.LeadResponse;
import com.estateflow.lead.entity.Lead;
import com.estateflow.user.entity.User;

@Component
public class LeadMapper {

	public LeadResponse toResponse(Lead lead) {

		Enquiry enquiry = lead.getEnquiry();
		User buyer = enquiry.getBuyer();
		User agent = lead.getAssignedAgent();

		return new LeadResponse(lead.getId(),

				enquiry.getId(), enquiry.getProperty().getId(), enquiry.getProperty().getTitle(),

				buyer.getId(), buyer.getFullName(), buyer.getEmail(),

				enquiry.getMessage(), enquiry.getSource(),

				agent != null ? agent.getId() : null, agent != null ? agent.getFullName() : null,

				lead.getStage(), lead.getPriority(),

				lead.getLostReason(), lead.getConvertedAt(),

				lead.getVersion(), lead.getCreatedAt(), lead.getUpdatedAt());
	}
}