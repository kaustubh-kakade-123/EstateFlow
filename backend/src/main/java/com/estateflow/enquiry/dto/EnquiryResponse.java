package com.estateflow.enquiry.dto;

import java.time.LocalDateTime;

import com.estateflow.enquiry.entity.EnquirySource;
import com.estateflow.enquiry.entity.EnquiryStatus;
import com.estateflow.lead.entity.LeadPriority;
import com.estateflow.lead.entity.LeadStage;

public record EnquiryResponse(

		Long enquiryId, Long propertyId, Long buyerUserId,

		String message, EnquirySource source, EnquiryStatus status,

		Long leadId, LeadStage leadStage, LeadPriority leadPriority,

		LocalDateTime createdAt

) {
}