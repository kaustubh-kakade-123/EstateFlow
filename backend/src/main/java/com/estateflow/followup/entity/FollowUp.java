package com.estateflow.followup.entity;

import java.time.LocalDateTime;

import com.estateflow.lead.entity.Lead;
import com.estateflow.user.entity.User;

import jakarta.persistence.*;

@Entity
@Table(name = "follow_ups")
public class FollowUp {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "lead_id", nullable = false)
	private Lead lead;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "assigned_to_user_id", nullable = false)
	private User assignedTo;

	@Column(name = "scheduled_at", nullable = false)
	private LocalDateTime scheduledAt;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private FollowUpStatus status;

	@Column(columnDefinition = "TEXT")
	private String note;

	@Column(name = "completed_at")
	private LocalDateTime completedAt;

	@Column(name = "created_at", nullable = false, insertable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
	private LocalDateTime updatedAt;

	public FollowUp() {
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

	public User getAssignedTo() {
		return assignedTo;
	}

	public void setAssignedTo(User assignedTo) {
		this.assignedTo = assignedTo;
	}

	public LocalDateTime getScheduledAt() {
		return scheduledAt;
	}

	public void setScheduledAt(LocalDateTime scheduledAt) {
		this.scheduledAt = scheduledAt;
	}

	public FollowUpStatus getStatus() {
		return status;
	}

	public void setStatus(FollowUpStatus status) {
		this.status = status;
	}

	public String getNote() {
		return note;
	}

	public void setNote(String note) {
		this.note = note;
	}

	public LocalDateTime getCompletedAt() {
		return completedAt;
	}

	public void setCompletedAt(LocalDateTime completedAt) {
		this.completedAt = completedAt;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}
}