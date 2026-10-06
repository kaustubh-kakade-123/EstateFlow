package com.estateflow.property.dto;

import java.math.BigDecimal;

import com.estateflow.property.entity.ListingType;
import com.estateflow.property.entity.PropertyType;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdatePropertyRequest(

        @NotBlank
        @Size(max = 180)
        String title,

        String description,

        @NotNull
        PropertyType propertyType,

        @NotNull
        ListingType listingType,

        @NotNull
        @DecimalMin(value = "0.0", inclusive = true)
        @Digits(integer = 13, fraction = 2)
        BigDecimal price,

        @DecimalMin(value = "0.0", inclusive = false)
        @Digits(integer = 8, fraction = 2)
        BigDecimal areaSqft,

        @Min(0)
        @Max(255)
        Integer bedrooms,

        @Min(0)
        @Max(255)
        Integer bathrooms,

        @Min(0)
        @Max(255)
        Integer parkingSpaces,

        @Size(max = 255)
        String addressLine,

        @NotBlank
        @Size(max = 120)
        String locality,

        @NotBlank
        @Size(max = 120)
        String city,

        @NotBlank
        @Size(max = 120)
        String state,

        @Size(max = 20)
        String postalCode,

        @DecimalMin("-90.0000000")
        @DecimalMax("90.0000000")
        BigDecimal latitude,

        @DecimalMin("-180.0000000")
        @DecimalMax("180.0000000")
        BigDecimal longitude

) {
}