package com.estateflow.property.dto;

import java.math.BigDecimal;

import com.estateflow.property.entity.ListingType;
import com.estateflow.property.entity.PropertyType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record PropertySearchCriteria(

		@Size(max = 120) String city,

		@Size(max = 120) String locality,

		PropertyType propertyType,

		ListingType listingType,

		@DecimalMin(value = "0.0", inclusive = true) BigDecimal minPrice,

		@DecimalMin(value = "0.0", inclusive = true) BigDecimal maxPrice,

		@Min(0) Integer bedrooms

) {
}