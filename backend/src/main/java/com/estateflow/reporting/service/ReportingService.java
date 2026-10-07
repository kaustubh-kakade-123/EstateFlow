package com.estateflow.reporting.service;

import java.util.EnumMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.estateflow.enquiry.repository.EnquiryRepository;
import com.estateflow.lead.entity.LeadStage;
import com.estateflow.lead.repository.LeadRepository;
import com.estateflow.property.entity.PropertyStatus;
import com.estateflow.property.repository.PropertyRepository;
import com.estateflow.reporting.dto.AdminDashboardResponse;
import com.estateflow.user.repository.UserRepository;
import com.estateflow.visit.entity.SiteVisitStatus;
import com.estateflow.visit.repository.SiteVisitRepository;

@Service
public class ReportingService {

	private final UserRepository userRepository;
	private final PropertyRepository propertyRepository;
	private final EnquiryRepository enquiryRepository;
	private final LeadRepository leadRepository;
	private final SiteVisitRepository siteVisitRepository;

	public ReportingService(UserRepository userRepository, PropertyRepository propertyRepository,
			EnquiryRepository enquiryRepository, LeadRepository leadRepository,
			SiteVisitRepository siteVisitRepository) {

		this.userRepository = userRepository;
		this.propertyRepository = propertyRepository;
		this.enquiryRepository = enquiryRepository;
		this.leadRepository = leadRepository;
		this.siteVisitRepository = siteVisitRepository;
	}

	@Transactional(readOnly = true)
	public AdminDashboardResponse getDashboard() {

		long totalUsers = userRepository.count();

		long totalProperties = propertyRepository.count();

		long publishedProperties = propertyRepository.countByStatusAndVerifiedTrue(PropertyStatus.PUBLISHED);

		long totalEnquiries = enquiryRepository.count();

		long totalLeads = leadRepository.count();

		long assignedLeads = leadRepository.countByAssignedAgentIsNotNull();

		long unassignedLeads = leadRepository.countByAssignedAgentIsNull();

		long totalSiteVisits = siteVisitRepository.count();

		long completedSiteVisits = siteVisitRepository.countByStatus(SiteVisitStatus.COMPLETED);

		long convertedLeads = leadRepository.countByStage(LeadStage.CONVERTED);

		long lostLeads = leadRepository.countByStage(LeadStage.LOST);

		Map<LeadStage, Long> leadsByStage = new EnumMap<>(LeadStage.class);

		for (LeadStage stage : LeadStage.values()) {

			leadsByStage.put(stage, leadRepository.countByStage(stage));
		}

		return new AdminDashboardResponse(totalUsers, totalProperties, publishedProperties,

				totalEnquiries, totalLeads,

				assignedLeads, unassignedLeads,

				totalSiteVisits, completedSiteVisits,

				convertedLeads, lostLeads,

				leadsByStage);
	}
}