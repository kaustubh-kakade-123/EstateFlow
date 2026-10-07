package com.estateflow.lead.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.estateflow.lead.entity.Lead;

public interface LeadRepository
extends JpaRepository<Lead, Long>,
        JpaSpecificationExecutor<Lead> {

	Optional<Lead> findByEnquiryId(Long enquiryId);

	List<Lead> findByAssignedAgentIdOrderByCreatedAtDesc(Long assignedAgentId);

	List<Lead> findAllByOrderByCreatedAtDesc();
}