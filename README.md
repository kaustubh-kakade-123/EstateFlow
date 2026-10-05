# EstateFlow

**Real Estate Marketplace & Lead CRM - Interview Technical Assignment**

EstateFlow is a one-week MVP that demonstrates an end-to-end real-estate journey:

`Property Discovery -> Enquiry -> Lead -> Follow-up -> Site Visit -> Conversion`

## Objective

Build a working module based on the company-provided Real Estate Software Project brief, supported by market research and professional documentation.

## Planned Users

- Buyer
- Owner
- Agent
- Builder
- Admin

## MVP Features

- JWT authentication and role-based access
- Property listing and management
- Search and filters
- Shortlisting
- Enquiries
- Lead creation and assignment
- Lead stages and activity history
- Follow-ups
- Site-visit scheduling
- Admin overview and basic funnel metrics
- Swagger/OpenAPI
- Validation, error handling and tests
- Dockerized local setup

## Proposed Stack

### Backend
- Java 17/21
- Spring Boot
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL
- Swagger/OpenAPI

### Frontend
- React
- TypeScript

### Delivery
- Docker / Docker Compose
- Git
- README + project report + diagrams + demo presentation

## Lead Lifecycle

`NEW -> CONTACTED -> QUALIFIED -> VISIT_SCHEDULED -> FOLLOW_UP -> NEGOTIATION -> CONVERTED / LOST`

> Status names are currently a design proposal and may evolve during implementation.

## Repository Structure

```text
EstateFlow/
├── backend/
├── frontend/
├── docs/
├── docker-compose.yml
└── README.md
```

## Current Status

Day 1:
- [x] Understand company brief
- [x] Initial market research
- [x] Define product problem
- [x] Freeze MVP scope
- [ ] Architecture
- [ ] ER diagram
- [ ] API contracts
- [ ] Implementation

## Scope Control

Not part of the one-week MVP: payment processing, live RERA integration, WhatsApp/SMS infrastructure, advanced AI, Elasticsearch-scale search, full builder inventory/finance modules, microservices/Kubernetes, or native mobile apps.

## Documentation

Detailed analysis is maintained in `docs/` and will be updated as the implementation progresses.
