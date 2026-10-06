package com.estateflow.property.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.estateflow.property.entity.Property;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByListedByIdOrderByCreatedAtDesc(Long listedByUserId);
}