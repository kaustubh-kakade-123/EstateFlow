package com.estateflow.property.mapper;

import org.springframework.stereotype.Component;

import com.estateflow.property.dto.CreatePropertyRequest;
import com.estateflow.property.dto.PropertyResponse;
import com.estateflow.property.entity.Property;

@Component
public class PropertyMapper {

    public Property toEntity(CreatePropertyRequest request) {
        Property property = new Property();

        property.setTitle(request.title().trim());
        property.setDescription(request.description());
        property.setPropertyType(request.propertyType());
        property.setListingType(request.listingType());
        property.setPrice(request.price());
        property.setAreaSqft(request.areaSqft());
        property.setBedrooms(request.bedrooms());
        property.setBathrooms(request.bathrooms());
        property.setParkingSpaces(request.parkingSpaces());
        property.setAddressLine(request.addressLine());
        property.setLocality(request.locality().trim());
        property.setCity(request.city().trim());
        property.setState(request.state().trim());
        property.setPostalCode(request.postalCode());
        property.setLatitude(request.latitude());
        property.setLongitude(request.longitude());

        return property;
    }

    public PropertyResponse toResponse(Property property) {
        return new PropertyResponse(
                property.getId(),
                property.getListedBy().getId(),
                property.getTitle(),
                property.getDescription(),
                property.getPropertyType(),
                property.getListingType(),
                property.getPrice(),
                property.getAreaSqft(),
                property.getBedrooms(),
                property.getBathrooms(),
                property.getParkingSpaces(),
                property.getAddressLine(),
                property.getLocality(),
                property.getCity(),
                property.getState(),
                property.getPostalCode(),
                property.getLatitude(),
                property.getLongitude(),
                property.getStatus(),
                property.isVerified(),
                property.getCreatedAt(),
                property.getUpdatedAt()
        );
    }
}