package com.estateflow.enquiry.dto;

import com.estateflow.enquiry.entity.EnquirySource;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateEnquiryRequest(

		@Size(max = 2000) String message,

		@NotNull EnquirySource source

) {
}