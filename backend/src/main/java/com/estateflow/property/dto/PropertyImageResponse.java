package com.estateflow.property.dto;

import java.time.LocalDateTime;

public record PropertyImageResponse(

		Long id, Long propertyId, String imageUrl, Integer displayOrder, boolean primary, LocalDateTime createdAt

) {
}