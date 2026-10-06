package com.estateflow.lead.entity;

import java.time.LocalDateTime;

import com.estateflow.enquiry.entity.Enquiry;
import com.estateflow.user.entity.User;

import jakarta.persistence.*;

@Entity
@Table(name = "leads")
public class Lead {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "enquiry_id", nullable = false, unique = true)
	private Enquiry enquiry;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "assigned_agent_id")
	private User assignedAgent;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private LeadStage stage;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private LeadPriority priority;

	@Column(name = "lost_reason", length = 255)
	private String lostReason;

	@Column(name = "converted_at")
	private LocalDateTime convertedAt;

	@Version
	@Column(nullable = false)
	private Long version;

	@Column(name = "created_at", nullable = false, insertable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
	private LocalDateTime updatedAt;

	public Lead() {
	}

	public Long getId() {
		return id;
	}

	public Enquiry getEnquiry() {
		return enquiry;
	}

	public void setEnquiry(Enquiry enquiry) {
		this.enquiry = enquiry;
	}

	public User getAssignedAgent() {
		return assignedAgent;
	}

	public void setAssignedAgent(User assignedAgent) {
		this.assignedAgent = assignedAgent;
	}

	public LeadStage getStage() {
		return stage;
	}

	public void setStage(LeadStage stage) {
		this.stage = stage;
	}

	public LeadPriority getPriority() {
		return priority;
	}

	public void setPriority(LeadPriority priority) {
		this.priority = priority;
	}

	public String getLostReason() {
		return lostReason;
	}

	public void setLostReason(String lostReason) {
		this.lostReason = lostReason;
	}

	public LocalDateTime getConvertedAt() {
		return convertedAt;
	}

	public void setConvertedAt(LocalDateTime convertedAt) {
		this.convertedAt = convertedAt;
	}

	public Long getVersion() {
		return version;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}
}