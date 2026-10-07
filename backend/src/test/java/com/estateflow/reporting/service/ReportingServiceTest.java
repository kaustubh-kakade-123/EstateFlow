package com.estateflow.reporting.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.estateflow.enquiry.repository.EnquiryRepository;
import com.estateflow.lead.entity.LeadStage;
import com.estateflow.lead.repository.LeadRepository;
import com.estateflow.property.entity.PropertyStatus;
import com.estateflow.property.repository.PropertyRepository;
import com.estateflow.reporting.dto.AdminDashboardResponse;
import com.estateflow.user.repository.UserRepository;
import com.estateflow.visit.entity.SiteVisitStatus;
import com.estateflow.visit.repository.SiteVisitRepository;

@ExtendWith(MockitoExtension.class)
class ReportingServiceTest {

	@Mock
	private UserRepository userRepository;

	@Mock
	private PropertyRepository propertyRepository;

	@Mock
	private EnquiryRepository enquiryRepository;

	@Mock
	private LeadRepository leadRepository;

	@Mock
	private SiteVisitRepository siteVisitRepository;

	private ReportingService reportingService;

	@BeforeEach
	void setUp() {
		reportingService = new ReportingService(userRepository, propertyRepository, enquiryRepository, leadRepository,
				siteVisitRepository);
	}

	@Test
	void shouldBuildAdminDashboardMetrics() {

		when(userRepository.count()).thenReturn(20L);
		when(propertyRepository.count()).thenReturn(12L);

		when(propertyRepository.countByStatusAndVerifiedTrue(PropertyStatus.PUBLISHED)).thenReturn(8L);

		when(enquiryRepository.count()).thenReturn(15L);

		when(leadRepository.count()).thenReturn(15L);
		when(leadRepository.countByAssignedAgentIsNotNull()).thenReturn(10L);
		when(leadRepository.countByAssignedAgentIsNull()).thenReturn(5L);

		when(siteVisitRepository.count()).thenReturn(7L);

		when(siteVisitRepository.countByStatus(SiteVisitStatus.COMPLETED)).thenReturn(4L);

		when(leadRepository.countByStage(LeadStage.CONVERTED)).thenReturn(3L);

		when(leadRepository.countByStage(LeadStage.LOST)).thenReturn(2L);

		for (LeadStage stage : LeadStage.values()) {
			if (stage != LeadStage.CONVERTED && stage != LeadStage.LOST) {

				when(leadRepository.countByStage(stage)).thenReturn(1L);
			}
		}

		AdminDashboardResponse response = reportingService.getDashboard();

		assertEquals(20L, response.totalUsers());
		assertEquals(12L, response.totalProperties());
		assertEquals(8L, response.publishedProperties());

		assertEquals(15L, response.totalEnquiries());
		assertEquals(15L, response.totalLeads());

		assertEquals(10L, response.assignedLeads());
		assertEquals(5L, response.unassignedLeads());

		assertEquals(7L, response.totalSiteVisits());
		assertEquals(4L, response.completedSiteVisits());

		assertEquals(3L, response.convertedLeads());
		assertEquals(2L, response.lostLeads());

		assertEquals(3L, response.leadsByStage().get(LeadStage.CONVERTED));

		assertEquals(2L, response.leadsByStage().get(LeadStage.LOST));
	}
}