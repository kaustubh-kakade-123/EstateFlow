# EstateFlow Implemented Architecture and Backend Handover

## 1. System overview

EstateFlow is a modular-monolith REST backend for a real-estate marketplace and lead CRM. The implementation uses domain-oriented packages while keeping deployment simple for the one-week assignment.

Primary backend modules:
- auth
- user
- security
- property
- shortlist
- enquiry
- lead
- visit
- followup
- reporting
- common
- config

## 2. Technology stack

- Java 17
- Spring Boot 4.0.6
- Spring Web MVC
- Spring Data JPA / Hibernate
- Spring Security
- JWT authentication
- Bean Validation
- MySQL 8
- Flyway database migrations
- Springdoc OpenAPI / Swagger UI
- Maven Wrapper
- JUnit 5 and Mockito-based tests

## 3. Architectural style

A modular monolith was selected instead of microservices.

Reasons:
- one-week delivery window;
- modules share a strongly connected transactional domain;
- simpler local development and demonstration;
- lower operational overhead;
- service boundaries can still be represented through packages and service classes.

Potential future extraction candidates include property/search, lead CRM, notifications and reporting if scale, ownership boundaries or deployment requirements justify separate services.

## 4. Layering

Typical request path:

HTTP Request
-> Controller
-> Request DTO + validation
-> Service / business rules
-> Repository
-> MySQL

Response path:

Entity
-> Mapper
-> Response DTO
-> HTTP Response

JPA entities are not exposed directly as the public API contract. DTOs isolate persistence structure from external API responses.

## 5. Security architecture

Authentication is stateless and JWT-based.

Main components:
- CustomUserDetailsService
- EstateFlowUserPrincipal
- JwtService
- JwtAuthenticationFilter
- JwtAuthenticationEntryPoint
- JwtAccessDeniedHandler
- SecurityConfig
- PasswordConfig

Authorization is implemented at two levels:
1. Role authorization, for example BUYER, OWNER, AGENT, BUILDER and ADMIN.
2. Resource authorization, for example an agent may access an assigned lead and an owner/builder may modify only a property they own.

Passwords are encoded with BCrypt. Runtime secrets are provided through environment variables rather than committed credentials.

HTTP semantics are kept distinct:
- 401: authentication is missing or invalid.
- 403: an authenticated principal lacks permission.

## 6. Property marketplace architecture

The property module includes:
- property entity and enums;
- create/update/search DTOs;
- mapper;
- repository;
- JPA specification-based search;
- service;
- public/owner property controller;
- admin moderation controller;
- property-image controller/service/repository.

Property lifecycle:

DRAFT
-> PENDING_APPROVAL
-> PUBLISHED

A rejected property may be corrected and resubmitted. Published public retrieval is restricted to verified properties.

Search supports marketplace-oriented criteria such as city, locality, property type, listing type, price range and bedrooms.

Property images are URL metadata in the MVP. Binary upload/storage infrastructure is deliberately outside scope.

## 7. Shortlist and enquiry architecture

BUYER users can shortlist published properties. The shortlist model is user-scoped so one buyer cannot access another buyer's shortlist.

Creating an enquiry is a transactional business operation. The service creates:
- the enquiry;
- a corresponding lead;
- an initial lead activity.

This transaction is the central bridge between the marketplace and CRM modules.

## 8. CRM architecture

The CRM is organized around Lead as the operational aggregate.

Lead data includes:
- source enquiry;
- assigned agent;
- stage;
- priority;
- lost reason;
- conversion timestamp;
- optimistic-lock version;
- timestamps.

Supporting records:
- LeadActivity
- SiteVisit
- FollowUp

LeadSpecification provides filtered lead retrieval. Agent access is scoped to assigned leads, while administrators have wider management access.

## 9. Database architecture

MySQL 8 is the system of record. Flyway owns schema evolution and Hibernate uses schema validation rather than automatic schema creation.

Migrations:
- V1__create_initial_schema.sql
- V2__seed_roles.sql

V1 defines the core domain tables including users, roles, properties, images, shortlists, enquiries, leads, lead activities, follow-ups and site visits.
V2 seeds the application roles.

Existing applied migrations are treated as immutable.

## 10. Error handling and validation

GlobalExceptionHandler centralizes API error responses.

Handled categories include:
- bad requests;
- resource-not-found conditions;
- conflicts/business-rule violations;
- invalid credentials;
- Bean Validation failures;
- invalid request bodies;
- parameter/type conversion errors.

The objective is predictable client-facing 4xx responses without leaking stack traces.

## 11. API documentation

Springdoc exposes OpenAPI metadata and Swagger UI for interactive API exploration.

Development endpoints:
- /v3/api-docs
- /swagger-ui.html

Swagger is used as the executable API reference; detailed endpoint behavior remains enforced by Spring Security and service-level business rules.

## 12. Testing

Automated tests currently cover:
- application context/bootstrap;
- lead-stage transition business rules;
- reporting aggregation.

The final backend clean test run executed 10 tests with zero failures and zero errors.

Manual API regression was also performed during implementation for authentication, role restrictions, ownership, property workflow, shortlist, enquiry creation, lead assignment/stages, visits, follow-ups, reporting and Swagger authorization.

## 13. Runtime configuration

Required runtime environment variables:
- DB_USERNAME
- DB_PASSWORD
- JWT_SECRET

The application connects to the estateflow_db MySQL database. Secrets must not be committed to source control.

## 14. Backend completion status

Implemented:
- JWT authentication and RBAC;
- user roles;
- property CRUD/lifecycle/moderation;
- public property search/details;
- property image metadata;
- buyer shortlist;
- enquiry-to-lead creation;
- lead assignment/filtering/activity history;
- lead stage workflow;
- site-visit lifecycle;
- follow-up lifecycle;
- admin dashboard;
- validation and centralized errors;
- Flyway migrations;
- OpenAPI/Swagger;
- automated business-rule tests.

The backend is considered feature-complete for the assignment MVP. Further backend work should be driven by frontend integration defects or explicitly selected future scope rather than new feature expansion.
