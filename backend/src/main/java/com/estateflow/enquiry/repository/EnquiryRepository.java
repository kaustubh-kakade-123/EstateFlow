package com.estateflow.enquiry.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.estateflow.enquiry.entity.Enquiry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EnquiryRepository extends JpaRepository<Enquiry, Long> {

	Page<Enquiry> findByBuyerId(Long buyerUserId, Pageable pageable);
}