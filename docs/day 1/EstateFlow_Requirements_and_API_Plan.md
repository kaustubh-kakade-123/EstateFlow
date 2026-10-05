# EstateFlow - Requirements and API Planning

## 1. Functional Requirements

### Authentication
- Register user
- Login
- JWT-based authentication
- Role-based authorization
- Roles: BUYER, OWNER, AGENT, BUILDER, ADMIN

### Property
- Create property
- Update property
- View property
- Search/filter properties
- Publish/archive property
- Admin verification
- Basic media metadata

### Shortlist
- Add property to shortlist
- Remove property from shortlist
- View buyer shortlist

### Enquiry
- Buyer submits enquiry against property
- Store message/contact context
- Create/associate lead

### Lead CRM
- Assign agent
- Update stage
- Record activity/note
- Set next follow-up
- View lead timeline
- Close as converted/lost

### Site Visit
- Schedule
- Reschedule
- Cancel
- Mark completed
- Store feedback

### Admin
- View/manage users
- Approve/verify listings
- View leads and visits
- Basic funnel/dashboard statistics

## 2. Candidate Domain Entities

- User
- Property
- PropertyImage
- Shortlist
- Enquiry
- Lead
- LeadActivity
- FollowUp
- SiteVisit
- Project (minimal / optional in MVP)
- AuditLog (optional)

## 3. Candidate REST API Surface

### Auth
- POST /api/auth/register
- POST /api/auth/login

### Properties
- GET /api/properties
- GET /api/properties/{id}
- POST /api/properties
- PUT /api/properties/{id}
- PATCH /api/properties/{id}/status
- DELETE /api/properties/{id}
- PATCH /api/admin/properties/{id}/verify

### Shortlists
- GET /api/shortlists/me
- POST /api/shortlists/{propertyId}
- DELETE /api/shortlists/{propertyId}

### Enquiries
- POST /api/properties/{propertyId}/enquiries
- GET /api/enquiries/me

### Leads
- GET /api/leads
- GET /api/leads/{id}
- PATCH /api/leads/{id}/assign
- PATCH /api/leads/{id}/stage
- POST /api/leads/{id}/activities
- POST /api/leads/{id}/follow-ups

### Site Visits
- POST /api/leads/{id}/site-visits
- PATCH /api/site-visits/{id}
- PATCH /api/site-visits/{id}/status

### Admin / Reporting
- GET /api/admin/dashboard
- GET /api/admin/users
- GET /api/admin/properties
- GET /api/admin/leads

## 4. Non-Functional Requirements

- Input validation
- Consistent API error model
- Role-based access control
- Password hashing
- Pagination for list endpoints
- Audit-friendly timestamps
- Database constraints and indexes
- OpenAPI documentation
- Unit/service tests for critical lead transitions
- Dockerized local execution

## 5. Open Design Decisions for Day 2

- Exact database cardinalities and ERD
- Property ownership model for Owner vs Builder
- Whether Enquiry and Lead are 1:1 in MVP
- Agent assignment policy
- Allowed lead-stage transition matrix
- Media storage strategy
- Dashboard query strategy
- Frontend page map
