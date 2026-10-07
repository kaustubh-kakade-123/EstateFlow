# EstateFlow - REST API Contract (MVP)

Base path: `/api/v1`

## 1. Authentication
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | /auth/register | Public | Register user |
| POST | /auth/login | Public | Authenticate and issue JWT |
| GET | /auth/me | Authenticated | Current user profile |

## 2. Properties
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | /properties | Public | Search/filter published properties |
| GET | /properties/{id} | Public | Property detail |
| POST | /properties | OWNER, BUILDER | Create listing |
| PUT | /properties/{id} | Listing owner | Update listing |
| DELETE | /properties/{id} | Listing owner/Admin | Archive listing |
| PATCH | /properties/{id}/submit | Listing owner | Submit for approval |
| PATCH | /admin/properties/{id}/approve | ADMIN | Approve/publish |
| PATCH | /admin/properties/{id}/reject | ADMIN | Reject listing |

Search query examples:
`?city=Pune&locality=Wakad&propertyType=APARTMENT&minPrice=5000000&maxPrice=10000000&bedrooms=2&page=0&size=20&sort=price,asc`

## 3. Shortlists
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | /shortlists/me | BUYER | My shortlisted properties |
| POST | /shortlists/{propertyId} | BUYER | Add property |
| DELETE | /shortlists/{propertyId} | BUYER | Remove property |

## 4. Enquiries
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | /properties/{propertyId}/enquiries | BUYER | Submit enquiry |
| GET | /enquiries/me | BUYER | My enquiries |
| GET | /enquiries | AGENT, ADMIN | Operational enquiry list |

Creating an enquiry creates the associated NEW lead transactionally for the MVP.

## 5. Leads
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | /leads | AGENT, ADMIN | Paginated lead list |
| GET | /leads/{id} | Assigned AGENT/Admin | Lead detail |
| PATCH | /leads/{id}/assign | ADMIN | Assign agent |
| PATCH | /leads/{id}/stage | Assigned AGENT/Admin | Controlled stage transition |
| POST | /leads/{id}/activities | Assigned AGENT/Admin | Add note/activity |
| GET | /leads/{id}/activities | Assigned AGENT/Admin | Timeline |

Lead filters:
`?stage=QUALIFIED&assignedAgentId=12&priority=HIGH&page=0&size=20`

## 6. Follow-ups
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | /leads/{id}/follow-ups | Assigned AGENT/Admin | Schedule follow-up |
| GET | /leads/{id}/follow-ups | Assigned AGENT/Admin | Lead follow-ups |
| PATCH | /follow-ups/{id} | Assigned AGENT/Admin | Reschedule/update |
| PATCH | /follow-ups/{id}/complete | Assigned AGENT/Admin | Complete |

## 7. Site Visits
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | /leads/{id}/site-visits | Assigned AGENT/Admin | Schedule visit |
| GET | /leads/{id}/site-visits | Assigned AGENT/Admin | Visit history |
| PATCH | /site-visits/{id} | Assigned AGENT/Admin | Reschedule/update |
| PATCH | /site-visits/{id}/status | Assigned AGENT/Admin | Complete/cancel/no-show |

## 8. Admin & Reporting
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | /admin/dashboard | ADMIN | Funnel/KPI summary |
| GET | /admin/users | ADMIN | User management view |
| GET | /admin/properties | ADMIN | Listing moderation view |
| GET | /admin/leads | ADMIN | CRM overview |

Dashboard MVP metrics:
- Total/published/pending properties
- New/open leads
- Leads by stage
- Enquiry -> lead count
- Scheduled/completed visits
- Converted/lost leads
- Lead -> visit conversion
- Visit -> conversion

## 9. Standard Error Response

```json
{
  "timestamp": "2026-10-05T14:30:00",
  "status": 409,
  "error": "Conflict",
  "code": "INVALID_LEAD_TRANSITION",
  "message": "Lead cannot transition from NEW to CONVERTED",
  "path": "/api/v1/leads/42/stage",
  "fieldErrors": []
}
```

## 10. API Standards
- JSON request/response.
- DTOs instead of exposing JPA entities.
- Bean Validation for request fields.
- Correct HTTP status codes.
- Pagination for collection endpoints.
- Consistent errors through `@RestControllerAdvice`.
- OpenAPI/Swagger documentation.
- Service-layer transactions.
- Authorization checks for both roles and resource ownership.
