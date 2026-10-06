package com.estateflow.enquiry.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.estateflow.enquiry.entity.Enquiry;

public interface EnquiryRepository extends JpaRepository<Enquiry, Long> {
}