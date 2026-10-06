package com.estateflow.property.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.estateflow.property.entity.Property;
import com.estateflow.property.entity.PropertyStatus;

public interface PropertyRepository extends JpaRepository<Property, Long> {

	List<Property> findByListedByIdOrderByCreatedAtDesc(Long listedByUserId);

	Optional<Property> findByIdAndStatusAndVerifiedTrue(Long id, PropertyStatus status);
}