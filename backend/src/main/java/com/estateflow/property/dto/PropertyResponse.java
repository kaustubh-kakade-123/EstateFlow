package com.estateflow.property.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.estateflow.property.entity.ListingType;
import com.estateflow.property.entity.PropertyStatus;
import com.estateflow.property.entity.PropertyType;

public record PropertyResponse(

        Long id,
        Long listedByUserId,
        String title,
        String description,
        PropertyType propertyType,
        ListingType listingType,
        BigDecimal price,
        BigDecimal areaSqft,
        Integer bedrooms,
        Integer bathrooms,
        Integer parkingSpaces,
        String addressLine,
        String locality,
        String city,
        String state,
        String postalCode,
        BigDecimal latitude,
        BigDecimal longitude,
        PropertyStatus status,
        boolean verified,
        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {
}