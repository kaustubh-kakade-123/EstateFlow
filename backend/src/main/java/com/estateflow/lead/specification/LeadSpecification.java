package com.estateflow.lead.specification;

import org.springframework.data.jpa.domain.Specification;

import com.estateflow.lead.entity.Lead;
import com.estateflow.lead.entity.LeadPriority;
import com.estateflow.lead.entity.LeadStage;

public final class LeadSpecification {

	private LeadSpecification() {
	}

	public static Specification<Lead> hasStage(LeadStage stage) {

		return (root, query, cb) -> stage == null ? cb.conjunction() : cb.equal(root.get("stage"), stage);
	}

	public static Specification<Lead> hasPriority(LeadPriority priority) {

		return (root, query, cb) -> priority == null ? cb.conjunction() : cb.equal(root.get("priority"), priority);
	}

	public static Specification<Lead> assignedTo(Long agentUserId) {

		return (root, query, cb) -> agentUserId == null ? cb.conjunction()
				: cb.equal(root.get("assignedAgent").get("id"), agentUserId);
	}
}