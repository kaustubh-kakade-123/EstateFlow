package com.estateflow.shortlist.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.estateflow.shortlist.entity.Shortlist;

public interface ShortlistRepository
        extends JpaRepository<Shortlist, Long> {

    boolean existsByUserIdAndPropertyId(
            Long userId,
            Long propertyId
    );

    List<Shortlist> findByUserIdOrderByCreatedAtDesc(
            Long userId
    );

    void deleteByUserIdAndPropertyId(
            Long userId,
            Long propertyId
    );
}