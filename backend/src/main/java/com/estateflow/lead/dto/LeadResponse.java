package com.estateflow.lead.dto;

import java.time.LocalDateTime;

import com.estateflow.enquiry.entity.EnquirySource;
import com.estateflow.lead.entity.LeadPriority;
import com.estateflow.lead.entity.LeadStage;

public record LeadResponse(

		Long id,

		Long enquiryId, Long propertyId, String propertyTitle,

		Long buyerUserId, String buyerName, String buyerEmail,

		String enquiryMessage, EnquirySource enquirySource,

		Long assignedAgentId, String assignedAgentName,

		LeadStage stage, LeadPriority priority,

		String lostReason, LocalDateTime convertedAt,

		Long version, LocalDateTime createdAt, LocalDateTime updatedAt

) {
}