# EstateFlow - Lead Workflow and State Rules

## 1. Goal
The lead workflow is a controlled state machine. Clients cannot set arbitrary lead stages.

## 2. Stages

```text
NEW
 -> CONTACTED
 -> QUALIFIED
 -> VISIT_SCHEDULED
 -> VISIT_COMPLETED
 -> FOLLOW_UP
 -> NEGOTIATION
 -> CONVERTED

Applicable active stages may transition to LOST.
```

## 3. Allowed Transitions

| Current | Allowed Next |
|---|---|
| NEW | CONTACTED, LOST |
| CONTACTED | QUALIFIED, FOLLOW_UP, LOST |
| QUALIFIED | VISIT_SCHEDULED, FOLLOW_UP, LOST |
| VISIT_SCHEDULED | VISIT_COMPLETED, FOLLOW_UP, LOST |
| VISIT_COMPLETED | FOLLOW_UP, NEGOTIATION, LOST |
| FOLLOW_UP | CONTACTED, QUALIFIED, VISIT_SCHEDULED, NEGOTIATION, LOST |
| NEGOTIATION | CONVERTED, FOLLOW_UP, LOST |
| CONVERTED | none |
| LOST | none |

## 4. Business Rules
- NEW -> CONVERTED is rejected.
- Terminal states CONVERTED and LOST cannot transition further in the MVP.
- LOST requires lostReason.
- CONVERTED sets convertedAt.
- Every successful transition creates a LeadActivity.
- Agent assignment creates a LeadActivity.
- Scheduling a visit creates a LeadActivity.
- Use optimistic locking to protect concurrent lead updates.
- Invalid transitions return HTTP 409 Conflict.

## 5. Suggested Domain API

```java
lead.changeStage(targetStage, actor);
lead.assignAgent(agent, actor);
lead.markLost(reason, actor);
```

The service controls authorization and transaction boundaries; the domain/service transition logic validates the state change.
