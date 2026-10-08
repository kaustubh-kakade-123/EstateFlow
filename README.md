# EstateFlow

**Real Estate Marketplace & Lead CRM**

EstateFlow is a full-stack real-estate software MVP that connects property discovery with a structured lead-management workflow.

The project demonstrates the complete business journey:

`Property Discovery -> Shortlist -> Enquiry -> Lead -> Assignment -> Site Visit -> Follow-up -> Conversion / Lost`

It was developed as a technical assignment based on a Real Estate Software Project brief, supported by market research, system design, backend implementation, testing, and project documentation.

---

## Problem Statement

Real-estate platforms typically involve two closely connected workflows:

### Marketplace Journey

`Search -> Filter -> View Property -> Shortlist -> Enquire`

### Sales / CRM Journey

`Enquiry -> Lead -> Assignment -> Qualification -> Site Visit -> Follow-up -> Negotiation -> Conversion / Lost`

EstateFlow connects these workflows so that a buyer enquiry becomes a traceable business lead rather than remaining an isolated contact request.

A core design principle is:

> Every meaningful customer action should create a clear and trackable business event.

---

## User Roles

EstateFlow supports five application roles:

| Role | Responsibilities |

| --- | --- |

| `BUYER` | Search properties, view listings, shortlist properties and submit enquiries |

| `OWNER` | Create and manage owned property listings |

| `AGENT` | Manage assigned leads, site visits and follow-ups |

| `BUILDER` | Create and manage property listings |

| `ADMIN` | Moderate properties, manage leads and view platform metrics |

Authorization combines role-based access control with resource-level ownership and assignment checks.

---

## Implemented Backend Features

### Authentication & Security

- User registration and login

- BCrypt password hashing

- JWT-based stateless authentication

- Role-based authorization

- Resource-level authorization

- Custom authentication entry point and access-denied handling

- Environment-based secret configuration

### Property Marketplace

- Property creation and update

- Owner/builder property management

- Property lifecycle management

- Admin property approval and rejection

- Public published-property details

- Property search and filtering

- Pagination

- Property image upload (JPEG, PNG and WebP), gallery management, primary-image selection and deletion
- Property images displayed in marketplace cards and property details

- Ownership validation

Property lifecycle:

`DRAFT -> PENDING_APPROVAL -> PUBLISHED`

Rejected properties can be corrected and resubmitted.

### Property Search

Public property discovery supports criteria including:

- City

- Locality

- Property type

- Listing type

- Minimum/maximum price

- Bedrooms

- Pagination

Only published and verified properties are exposed through public discovery.

### Shortlist

Buyers can:

- Add properties to their shortlist

- View their shortlist

- Remove shortlisted properties

Shortlists are isolated by authenticated buyer.

### Enquiry Management

A buyer can submit an enquiry for a published property.

Creating an enquiry automatically creates:

`Enquiry -> Lead -> Initial Lead Activity`

The operation is transactional so the system does not leave partially created CRM data.

### Lead CRM

Implemented CRM capabilities include:

- Automatic lead creation

- Admin lead assignment/reassignment

- Agent-specific lead access

- Lead filtering and pagination

- Lead priorities

- Controlled lead-stage transitions

- Lead activity history

- Lost reasons

- Conversion timestamps

- Optimistic locking

### Lead Lifecycle

```text
NEW
|
v
CONTACTED
|
v
QUALIFIED
|
+----------> FOLLOW_UP
|
v
VISIT_SCHEDULED
|
v
VISIT_COMPLETED
|
+----------> FOLLOW_UP
|
v
NEGOTIATION
|
+----------> FOLLOW_UP
|
v
CONVERTED
Active stages may transition to LOST where permitted.
CONVERTED and LOST are terminal states.
```

Transition rules are enforced by the backend rather than relying on the client.

Visit-related stages are controlled through the site-visit workflow so that CRM state remains consistent with actual visit records.

### Site Visits

- Schedule site visits

- Reschedule visits

- Complete visits

- Cancel visits

- Mark no-show

- Agent/admin access control

- CRM stage synchronization

- Activity tracking

### Follow-ups

- Create follow-up tasks

- Complete follow-ups

- Cancel follow-ups

- Prevent duplicate pending follow-ups

- Agent/admin authorization

- Lead workflow integration

### Admin Dashboard

The backend exposes administrative metrics including:

- Total users

- Total properties

- Published properties

- Total enquiries

- Total leads

- Assigned leads

- Unassigned leads

- Site visits

- Completed site visits

- Converted leads

- Lost leads

- Leads grouped by stage

---

## Backend Architecture

EstateFlow currently uses a **modular monolith**.

This architecture was selected deliberately for the MVP because the business modules are closely related and the project has a short delivery timeline.

```text
Client
|
v
REST Controller
|
v
Request DTO + Validation
|
v
Service / Business Rules
|
v
Repository
|
v
MySQL
```

Response objects are mapped through DTOs rather than exposing JPA entities directly.

The codebase is organized around domain modules such as:

```text
auth
user
security
property
shortlist
enquiry
lead
visit
followup
reporting
common
config
```

The modular structure allows selected domains to be extracted into independent services later if scale or organizational boundaries require it.

---

## Technology Stack

### Backend

- Java 17

- Spring Boot 4.0.6

- Spring Web MVC

- Spring Data JPA

- Hibernate

- Spring Security

- JWT

- Bean Validation

- MySQL 8

- Flyway

- Springdoc OpenAPI / Swagger UI

- Maven

### Testing

- JUnit 5

- Mockito

- Spring Boot Test

- Maven Surefire

### Frontend

- React 19

- TypeScript

- Vite 8

- React Router

- REST API integration

- Role-based dashboards and protected routes

The frontend is implemented and integrated with the Spring Boot backend.

Implemented frontend features include:

- User registration and login

- Public property marketplace with search and filters

- Property details and image galleries

- Buyer shortlist and enquiries

- Owner/builder property creation, editing and image management

- Admin property moderation and dashboard

- Agent/admin Lead CRM

- Site visit scheduling and management

- Follow-up task management

---

## Database Management

EstateFlow uses **MySQL 8** as its relational database.

Database schema evolution is managed through **Flyway**.

Current migrations:

```text
V1__create_initial_schema.sql
V2__seed_roles.sql
```

Hibernate is configured to validate the schema rather than create or modify it automatically.

Applied Flyway migrations are treated as immutable. Future database changes should be introduced through new versioned migrations.

---

## API Documentation

OpenAPI documentation is generated using Springdoc.

When the backend is running locally:

```text
Swagger UI:
http://localhost:8080/swagger-ui.html
OpenAPI JSON:
http://localhost:8080/v3/api-docs
```

Swagger can be used to inspect and test the REST API.

Protected endpoints use JWT Bearer authentication.

---

## Running the Backend

### Prerequisites

Install:

- Java 17

- MySQL 8

The repository includes the Maven Wrapper, so a separate global Maven installation is not required.

### Database

Create the database:

```sql
CREATE DATABASE estateflow_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### Environment Variables

Configure:

```text
DB_USERNAME
DB_PASSWORD
JWT_SECRET
```

Do not commit real credentials or JWT secrets to source control.

### Start the Application

Windows:

```bat
cd backend
mvnw.cmd spring-boot:run
```

Or run `EstateFlowBackendApplication` through Spring Tool Suite / your IDE.

Flyway automatically validates and applies pending migrations during startup.

---

## Running the Frontend

### Prerequisites

- Node.js and npm
- EstateFlow backend running at `http://localhost:8080`

### Install Dependencies

From the repository root, open a separate terminal:

```bat
cd frontend
npm install
```

### Start the Development Server

```bat
npm run dev
```

Open the URL shown by Vite (normally `http://localhost:5173`).

The Vite development proxy forwards `/api` requests to the Spring Boot backend at `http://localhost:8080`. Property images served by the backend are accessible through this proxy during local development.

### Frontend Checks

```bat
npm run lint
npm run build
```

The production frontend build is written to `frontend/dist/`.

---

## Testing

Run the complete backend test suite:

```bat
cd backend
mvnw.cmd clean test
```

Backend completion audit result:

```text
Tests run: 10
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS
```

Automated coverage currently includes:

- Spring application-context/startup verification

- Lead-stage transition business rules

- Reporting-service aggregation

The backend was additionally tested manually across authentication, authorization, property workflows, search, shortlist, enquiry creation, lead management, site visits, follow-ups, reporting and OpenAPI.

---

## Repository Structure

```text
EstateFlow/
|
+-- backend/
|   +-- src/
|   |   +-- main/
|   |   |   +-- java/com/estateflow/
|   |   |   +-- resources/
|   |   |       +-- db/migration/
|   |   +-- test/
|   +-- pom.xml
|   +-- mvnw
|   +-- mvnw.cmd
|
+-- frontend/
|
+-- docs/
|   +-- requirements/
|   +-- design/
|   +-- backend/
|
+-- presentation/
|
+-- .gitignore
+-- README.md
```

---

## Documentation

Project documentation is organized by purpose rather than only by implementation date.

### Requirements & Planning

`docs/requirements/`

Contains:

- Initial project report

- Requirements analysis

- API planning

- MVP scope

### System Design

`docs/design/`

Contains:

- Architecture design

- Database design

- API design

- Lead workflow design

- Backend bootstrap documentation

- Technical design document

### Backend & Research

`docs/backend/`

Contains:

- `market-research.md`

- `implemented-architecture.md`

- `crm-workflow.md`

- `testing-and-completion.md`

- `EstateFlow_Backend_Handover.docx`

These documents describe the final implemented backend rather than only the original design.

---

## Market Research & Product Positioning

The project research considered both sides of real-estate software:

**Property marketplaces** focus primarily on property discovery, listings, search and buyer/seller interaction.

**Real-estate CRM systems** focus on lead capture, assignment, follow-ups, site visits, sales pipelines and conversion tracking.

EstateFlow demonstrates the integration between these two workflows:

```text
Marketplace
Search -> Property -> Shortlist -> Enquiry
|
v
CRM
Lead -> Agent -> Visit -> Follow-up -> Conversion / Lost
```

EstateFlow is an MVP and is not presented as a replacement for established property portals or enterprise CRM platforms.

Detailed research is available in:

`docs/backend/market-research.md`

---

## Scope Control

The following capabilities are intentionally outside the current MVP:

- Full builder project/tower/unit inventory

- Payment processing

- Brokerage accounting

- Live RERA integration

- WhatsApp/SMS/calling infrastructure

- AI recommendations and lead scoring

- Elasticsearch/geospatial search

- Native mobile applications

- Microservice/Kubernetes deployment

- Enterprise post-sales/collections workflows

These are potential future enhancements rather than requirements for the current assignment.

---

## Current Project Status

### Requirements & Research

- [x] Understand project brief

- [x] Market research

- [x] Define user roles

- [x] Define MVP scope

### Design

- [x] System architecture

- [x] Database design

- [x] API planning

- [x] CRM workflow design

### Backend

- [x] Authentication and JWT security

- [x] Property marketplace

- [x] Search and filtering

- [x] Property moderation

- [x] Property images

- [x] Shortlisting

- [x] Enquiries

- [x] Lead CRM

- [x] Site visits

- [x] Follow-ups

- [x] Admin reporting

- [x] OpenAPI / Swagger

- [x] Automated tests

- [x] Backend audit

- [x] Backend documentation

### Frontend

- [x] React + TypeScript + Vite setup
- [x] Authentication UI
- [x] Property marketplace UI and search
- [x] Property images on listing cards and details pages
- [x] Property image upload and management
- [x] Buyer shortlist and enquiry workflows
- [x] Owner/builder property workflows
- [x] Agent/admin Lead CRM
- [x] Site visits and follow-ups
- [x] Admin dashboard and moderation

### Final Delivery

- [x] Frontend/backend integration
- [x] End-to-end functional validation
- [x] Backend automated tests
- [x] Frontend lint and production build
- [ ] Screenshots
- [ ] Final project report
- [ ] Demo presentation
- [ ] Interview/demo walkthrough

---

## Future Architecture

If EstateFlow grows beyond the MVP, possible evolution areas include:

- Dedicated property/search service

- Dedicated CRM service

- Notification service

- Object storage/CDN for property media

- Redis caching

- Elasticsearch or geospatial search

- Event-driven integrations

- Observability and centralized logging

- CI/CD

- Containerized cloud deployment

These changes should be driven by actual scale and operational requirements rather than introduced prematurely.

---

## Project Goal

EstateFlow is intended to demonstrate more than CRUD APIs.

The project focuses on translating a real-estate business problem into:

**Requirements -> Architecture -> Data Model -> Secure APIs -> Business Workflows -> Testing -> Documentation -> Working Product**

The central technical workflow remains:

**Property Search -> Enquiry -> Lead -> Agent -> Site Visit -> Follow-up -> Conversion**
