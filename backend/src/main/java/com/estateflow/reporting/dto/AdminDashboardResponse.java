package com.estateflow.reporting.dto;

import java.util.Map;

import com.estateflow.lead.entity.LeadStage;

public record AdminDashboardResponse(

		long totalUsers, long totalProperties, long publishedProperties,

		long totalEnquiries, long totalLeads,

		long assignedLeads, long unassignedLeads,

		long totalSiteVisits, long completedSiteVisits,

		long convertedLeads, long lostLeads,

		Map<LeadStage, Long> leadsByStage

) {
}