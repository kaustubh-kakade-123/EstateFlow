package com.estateflow.visit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.estateflow.visit.entity.SiteVisit;

public interface SiteVisitRepository extends JpaRepository<SiteVisit, Long> {

	List<SiteVisit> findByLeadIdOrderByScheduledAtDesc(Long leadId);

	boolean existsByLeadIdAndStatus(Long leadId, com.estateflow.visit.entity.SiteVisitStatus status);
}