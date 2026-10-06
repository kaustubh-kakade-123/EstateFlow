package com.estateflow.shortlist.dto;

import java.time.LocalDateTime;

import com.estateflow.property.dto.PropertyResponse;

public record ShortlistResponse(
        Long id,
        PropertyResponse property,
        LocalDateTime createdAt
) {
}