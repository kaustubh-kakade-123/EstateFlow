# EstateFlow CRM Workflow and Business Rules

## 1. Objective

The CRM module makes the buyer enquiry traceable from initial interest through sales activity and final outcome.

Core flow:

Property
-> Enquiry
-> Lead
-> Assignment
-> Contact / Qualification
-> Site Visit
-> Follow-up / Negotiation
-> Converted or Lost

## 2. Enquiry-to-lead creation

A BUYER submits an enquiry against a published, verified property.

Within one transaction:
1. the enquiry is stored;
2. a lead is created in NEW stage with MEDIUM priority;
3. a CREATED lead activity is stored.

If the operation fails, the transaction prevents a partial enquiry/lead state.

## 3. Assignment

An ADMIN can assign or reassign a lead to a user who has the AGENT role.

Assignment creates an ASSIGNED activity. AGENT access to lead details and management operations is resource-scoped to the assigned agent.

## 4. Lead stages

Stages:
- NEW
- CONTACTED
- QUALIFIED
- VISIT_SCHEDULED
- VISIT_COMPLETED
- FOLLOW_UP
- NEGOTIATION
- CONVERTED
- LOST

Allowed business transitions:

NEW -> CONTACTED, LOST

CONTACTED -> QUALIFIED, FOLLOW_UP, LOST

QUALIFIED -> VISIT_SCHEDULED, FOLLOW_UP, LOST

VISIT_SCHEDULED -> VISIT_COMPLETED, FOLLOW_UP, LOST

VISIT_COMPLETED -> FOLLOW_UP, NEGOTIATION, LOST

FOLLOW_UP -> CONTACTED, QUALIFIED, VISIT_SCHEDULED, NEGOTIATION, LOST

NEGOTIATION -> CONVERTED, FOLLOW_UP, LOST

CONVERTED -> terminal

LOST -> terminal

Same-stage and invalid transitions are rejected as conflicts.

## 5. Visit-controlled stages

VISIT_SCHEDULED and VISIT_COMPLETED represent real operational events. The generic stage-update workflow is not allowed to set these stages directly.

Instead:
- scheduling a site visit moves the lead to VISIT_SCHEDULED;
- completing a site visit moves the lead to VISIT_COMPLETED;
- cancellation/no-show returns the lead to FOLLOW_UP.

This prevents the lead pipeline from claiming a visit happened when no corresponding SiteVisit record exists.

## 6. Site visit lifecycle

SiteVisit statuses:
- SCHEDULED
- COMPLETED
- CANCELLED
- NO_SHOW

Scheduling is available to ADMIN or the assigned AGENT when the lead is in an appropriate stage. The MVP allows only one currently scheduled visit per lead.

A scheduled visit may be rescheduled. Terminal visit records cannot be mutated. A new visit may later be scheduled after a cancelled/no-show workflow when the lead returns to FOLLOW_UP.

Visit operations create lead activity records.

## 7. Follow-up lifecycle

FollowUp statuses:
- PENDING
- COMPLETED
- CANCELLED

The MVP permits one PENDING follow-up per lead.

Follow-ups can be created by an ADMIN or assigned AGENT, subject to lead state. Creating a follow-up may move an active lead into FOLLOW_UP where appropriate.

Completing a follow-up task does not automatically decide the next sales stage. The user must explicitly perform the next valid lead transition.

## 8. Lost and converted leads

LOST requires a reason so the outcome is explainable.

CONVERTED records a conversion timestamp.

Both are terminal stages in the MVP.

## 9. Activity trail

LeadActivity records important CRM events, including:
- CREATED
- ASSIGNED
- STAGE_CHANGED
- NOTE_ADDED
- FOLLOW_UP_CREATED
- VISIT_SCHEDULED
- VISIT_UPDATED

Activities preserve a trace of operational changes around the lead.

## 10. Concurrency

Lead uses optimistic locking through a version field. This provides protection against silently overwriting concurrent lead updates and is appropriate for a CRM record that may be touched by multiple operational users.

## 11. CRM read model

ADMIN users can view the wider lead set and filter it.

AGENT users are restricted to their assigned leads even when query/filter parameters are supplied. This is an important IDOR-prevention rule: client-supplied identifiers do not override server-side ownership/assignment constraints.

Buyer enquiry history is exposed separately for the authenticated buyer.

## 12. Reporting

The admin dashboard aggregates:
- total users;
- total properties;
- published properties;
- total enquiries;
- total leads;
- assigned/unassigned leads;
- site visits;
- completed visits;
- converted leads;
- lost leads;
- leads grouped by stage.

The current dashboard deliberately reports raw counts. More advanced funnel rates, response-time metrics and time-series analytics are future enhancements.
