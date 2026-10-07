package com.estateflow.lead.entity;

import java.time.LocalDateTime;

import com.estateflow.user.entity.User;

import jakarta.persistence.*;

@Entity
@Table(name = "lead_activities")
public class LeadActivity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "lead_id", nullable = false)
	private Lead lead;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "performed_by_user_id", nullable = false)
	private User performedBy;

	@Enumerated(EnumType.STRING)
	@Column(name = "activity_type", nullable = false)
	private LeadActivityType activityType;

	@Column(columnDefinition = "TEXT")
	private String description;

	@Enumerated(EnumType.STRING)
	@Column(name = "old_stage")
	private LeadStage oldStage;

	@Enumerated(EnumType.STRING)
	@Column(name = "new_stage")
	private LeadStage newStage;

	@Column(name = "created_at", nullable = false, insertable = false, updatable = false)
	private LocalDateTime createdAt;

	public LeadActivity() {
	}

	public Long getId() {
		return id;
	}

	public Lead getLead() {
		return lead;
	}

	public void setLead(Lead lead) {
		this.lead = lead;
	}

	public User getPerformedBy() {
		return performedBy;
	}

	public void setPerformedBy(User performedBy) {
		this.performedBy = performedBy;
	}

	public LeadActivityType getActivityType() {
		return activityType;
	}

	public void setActivityType(LeadActivityType activityType) {
		this.activityType = activityType;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public LeadStage getOldStage() {
		return oldStage;
	}

	public void setOldStage(LeadStage oldStage) {
		this.oldStage = oldStage;
	}

	public LeadStage getNewStage() {
		return newStage;
	}

	public void setNewStage(LeadStage newStage) {
		this.newStage = newStage;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
}