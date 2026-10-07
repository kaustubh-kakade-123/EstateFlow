package com.estateflow.lead.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.estateflow.lead.entity.LeadActivity;

public interface LeadActivityRepository extends JpaRepository<LeadActivity, Long> {

	List<LeadActivity> findByLeadIdOrderByCreatedAtAsc(Long leadId);
}