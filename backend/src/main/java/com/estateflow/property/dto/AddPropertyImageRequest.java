package com.estateflow.property.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddPropertyImageRequest(

		@NotBlank @Size(max = 500) String imageUrl,

		@Min(0) Integer displayOrder,

		boolean primary

) {
}