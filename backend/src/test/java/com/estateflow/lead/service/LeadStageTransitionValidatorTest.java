package com.estateflow.lead.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.estateflow.common.exception.ConflictException;
import com.estateflow.lead.entity.LeadStage;

class LeadStageTransitionValidatorTest {

	private LeadStageTransitionValidator validator;

	@BeforeEach
	void setUp() {
		validator = new LeadStageTransitionValidator();
	}

	@Test
	void shouldAllowNewToContacted() {
		assertDoesNotThrow(() -> validator.validate(LeadStage.NEW, LeadStage.CONTACTED));
	}

	@Test
	void shouldAllowQualifiedToFollowUp() {
		assertDoesNotThrow(() -> validator.validate(LeadStage.QUALIFIED, LeadStage.FOLLOW_UP));
	}

	@Test
	void shouldAllowNegotiationToConverted() {
		assertDoesNotThrow(() -> validator.validate(LeadStage.NEGOTIATION, LeadStage.CONVERTED));
	}

	@Test
	void shouldRejectNewToConverted() {
		assertThrows(ConflictException.class, () -> validator.validate(LeadStage.NEW, LeadStage.CONVERTED));
	}

	@Test
	void shouldRejectSameStageTransition() {
		assertThrows(ConflictException.class, () -> validator.validate(LeadStage.CONTACTED, LeadStage.CONTACTED));
	}

	@Test
	void shouldRejectTransitionFromConverted() {
		assertThrows(ConflictException.class, () -> validator.validate(LeadStage.CONVERTED, LeadStage.FOLLOW_UP));
	}

	@Test
	void shouldRejectTransitionFromLost() {
		assertThrows(ConflictException.class, () -> validator.validate(LeadStage.LOST, LeadStage.CONTACTED));
	}

	@Test
	void shouldEnforceCompleteTransitionMatrix() {

		assertAllowed(LeadStage.NEW, LeadStage.CONTACTED, LeadStage.LOST);

		assertAllowed(LeadStage.CONTACTED, LeadStage.QUALIFIED, LeadStage.FOLLOW_UP, LeadStage.LOST);

		assertAllowed(LeadStage.QUALIFIED, LeadStage.VISIT_SCHEDULED, LeadStage.FOLLOW_UP, LeadStage.LOST);

		assertAllowed(LeadStage.VISIT_SCHEDULED, LeadStage.VISIT_COMPLETED, LeadStage.FOLLOW_UP, LeadStage.LOST);

		assertAllowed(LeadStage.VISIT_COMPLETED, LeadStage.FOLLOW_UP, LeadStage.NEGOTIATION, LeadStage.LOST);

		assertAllowed(LeadStage.FOLLOW_UP, LeadStage.CONTACTED, LeadStage.QUALIFIED, LeadStage.VISIT_SCHEDULED,
				LeadStage.NEGOTIATION, LeadStage.LOST);

		assertAllowed(LeadStage.NEGOTIATION, LeadStage.CONVERTED, LeadStage.FOLLOW_UP, LeadStage.LOST);
	}

	private void assertAllowed(LeadStage from, LeadStage... targets) {

		for (LeadStage target : targets) {

			assertDoesNotThrow(() -> validator.validate(from, target), from + " -> " + target);
		}
	}
}