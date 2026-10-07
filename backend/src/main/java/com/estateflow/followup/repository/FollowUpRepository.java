package com.estateflow.followup.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.estateflow.followup.entity.FollowUp;
import com.estateflow.followup.entity.FollowUpStatus;

public interface FollowUpRepository extends JpaRepository<FollowUp, Long> {

	List<FollowUp> findByLeadIdOrderByScheduledAtDesc(Long leadId);

	boolean existsByLeadIdAndStatus(Long leadId, FollowUpStatus status);
}