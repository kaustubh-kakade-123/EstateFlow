package com.estateflow.property.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.estateflow.property.entity.PropertyImage;

public interface PropertyImageRepository extends JpaRepository<PropertyImage, Long> {

	List<PropertyImage> findByPropertyIdOrderByDisplayOrderAsc(Long propertyId);

	boolean existsByPropertyIdAndPrimaryTrue(Long propertyId);
}