package com.estateflow.lead.service;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.estateflow.common.exception.ConflictException;
import com.estateflow.lead.entity.LeadStage;

@Component
public class LeadStageTransitionValidator {

	private static final Map<LeadStage, Set<LeadStage>> ALLOWED_TRANSITIONS = Map.of(

			LeadStage.NEW, EnumSet.of(LeadStage.CONTACTED, LeadStage.LOST),

			LeadStage.CONTACTED, EnumSet.of(LeadStage.QUALIFIED, LeadStage.FOLLOW_UP, LeadStage.LOST),

			LeadStage.QUALIFIED, EnumSet.of(LeadStage.VISIT_SCHEDULED, LeadStage.FOLLOW_UP, LeadStage.LOST),

			LeadStage.VISIT_SCHEDULED, EnumSet.of(LeadStage.VISIT_COMPLETED, LeadStage.FOLLOW_UP, LeadStage.LOST),

			LeadStage.VISIT_COMPLETED, EnumSet.of(LeadStage.FOLLOW_UP, LeadStage.NEGOTIATION, LeadStage.LOST),

			LeadStage.FOLLOW_UP,
			EnumSet.of(LeadStage.CONTACTED, LeadStage.QUALIFIED, LeadStage.VISIT_SCHEDULED, LeadStage.NEGOTIATION,
					LeadStage.LOST),

			LeadStage.NEGOTIATION, EnumSet.of(LeadStage.CONVERTED, LeadStage.FOLLOW_UP, LeadStage.LOST));

	public void validate(LeadStage currentStage, LeadStage targetStage) {

		Set<LeadStage> allowed = ALLOWED_TRANSITIONS.getOrDefault(currentStage, Set.of());

		if (!allowed.contains(targetStage)) {
			throw new ConflictException("Invalid lead stage transition from " + currentStage + " to " + targetStage);
		}
	}
}