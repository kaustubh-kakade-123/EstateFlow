package com.estateflow.reporting.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.estateflow.reporting.dto.AdminDashboardResponse;
import com.estateflow.reporting.service.ReportingService;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

	private final ReportingService reportingService;

	public AdminDashboardController(ReportingService reportingService) {

		this.reportingService = reportingService;
	}

	@GetMapping
	public ResponseEntity<AdminDashboardResponse> getDashboard() {

		return ResponseEntity.ok(reportingService.getDashboard());
	}
}