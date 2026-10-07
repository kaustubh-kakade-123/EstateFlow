# EstateFlow Market Research and Product Positioning

## 1. Purpose

EstateFlow was designed as a one-week technical assignment around a real-estate software platform. The research goal was not to reproduce a commercial portal or enterprise CRM. It was to identify the major workflows in Indian property software and select a technically meaningful vertical slice that can be implemented, tested, demonstrated, and explained.

## 2. Market categories observed

The market can be viewed as two overlapping product categories.

### Property discovery marketplaces
Consumer-facing platforms focus on helping buyers or tenants discover properties while helping owners, agents, and builders publish listings and receive responses. Common capabilities include location-based search, filters, property details and photos, listing management, shortlisting, enquiries, and seller/buyer connection.

Examples reviewed:
- Magicbricks: property discovery plus listing, response management, locality/market information, financing and adjacent home services.
- Housing.com: buy/rent/sell discovery with city/locality search, property-type filters and seller-interest/contact flows.
- NoBroker: a direct owner/customer marketplace emphasizing brokerage-free discovery, property posting, verification, shortlisting and direct connection.

### Real-estate CRM / sales operations
CRM-oriented products focus on the business process after a prospect becomes a lead. Common capabilities include lead capture, assignment/routing, pipeline stages, follow-ups, site visits, communication history, reporting, inventory, and conversion tracking.

Sell.Do was reviewed as a representative real-estate-specific CRM. Its public product material emphasizes connected lead capture, sales/pre-sales, site visits, inventory, communication, reporting and the lifecycle from initial lead through later sales/post-sales processes.

## 3. Problem identified

Marketplace activity and CRM activity are closely connected but are often discussed as separate concerns:

Buyer journey:
Search -> View Property -> Shortlist -> Enquire

Business journey:
Enquiry -> Lead -> Assignment -> Contact/Qualification -> Site Visit -> Follow-up/Negotiation -> Converted or Lost

For a technical assignment, the most useful problem to demonstrate is the handoff between these journeys. A user action should create a traceable business event rather than disappear after an enquiry form is submitted.

## 4. EstateFlow positioning

EstateFlow is positioned as a demonstration platform that combines:

1. A property marketplace for discovery and listing management.
2. A lightweight real-estate CRM for tracking enquiries through operational follow-up and outcome.

EstateFlow is not presented as a replacement for established portals or enterprise CRMs. Its value in this project is demonstrating the integration boundary between marketplace activity and a structured lead lifecycle.

## 5. Competitive feature observations

| Capability | Marketplace platforms | Real-estate CRM platforms | EstateFlow MVP |
| --- | --- | --- | --- |
| Property search/filtering | Core | Sometimes secondary | Implemented |
| Owner/builder listings | Core | Inventory-oriented | Implemented |
| Property verification/moderation | Common trust workflow | Varies | Implemented |
| Shortlisting | Common | Not core | Implemented |
| Buyer enquiry | Core conversion action | Lead source | Implemented |
| Enquiry-to-lead traceability | Usually internal/opaque to buyer | Core | Implemented explicitly |
| Agent assignment | Limited consumer visibility | Core | Implemented |
| Lead stages | Not consumer-facing core | Core | Implemented |
| Site visits | Often contact/appointment oriented | Core | Implemented |
| Follow-ups | Not marketplace core | Core | Implemented |
| Activity history | Limited consumer-facing visibility | Core | Implemented |
| Funnel/dashboard metrics | Business-side | Core | Implemented basic dashboard |
| Project/tower/unit inventory | Builder/project products | Common enterprise capability | Future scope |
| WhatsApp/calling/SMS automation | Varies | Common | Future scope |
| Payments/collections/post-sales | Adjacent or separate services | Available in enterprise suites | Future scope |
| AI scoring/recommendations | Increasingly available | Increasingly available | Future scope |

## 6. User groups

EstateFlow models five roles:
- BUYER: discover, shortlist and enquire about published properties.
- OWNER: create and manage owned property listings.
- AGENT: work assigned leads, visits and follow-ups.
- BUILDER: manage listings similarly to an owner in the MVP, with larger project/inventory functionality reserved for future scope.
- ADMIN: moderate listings, assign/manage leads and view platform-level metrics.

## 7. MVP scope rationale

The MVP prioritizes a complete, demonstrable flow over breadth:

Authentication -> Property Listing -> Search -> Shortlist -> Enquiry -> Lead -> Agent Workflow -> Site Visit -> Follow-up -> Conversion/Loss -> Reporting

This scope demonstrates domain modelling, REST API design, transactional business rules, security, persistence, workflow state transitions, reporting and testing within the assignment timeline.

## 8. Product differentiation for the assignment

The differentiator is not a claim of market novelty. It is the technical integration of consumer actions with operational CRM state.

Key design principle:
"Every meaningful customer action should create a clear, trackable business event."

An enquiry therefore creates both an enquiry record and a lead. Subsequent assignment, stage changes, visits and follow-ups remain connected to that lead and can be audited through lead activities.

## 9. Limitations and future opportunities

The current project intentionally excludes:
- full builder project/tower/unit inventory;
- payment, booking and collection accounting;
- RERA/DPDP-specific enterprise compliance workflows;
- WhatsApp, SMS, email and telephony integrations;
- brokerage and channel-partner accounting;
- Elasticsearch/geospatial search;
- AI lead scoring and recommendations;
- native mobile applications;
- production cloud deployment and microservice decomposition.

These are expansion areas rather than missing requirements for the one-week MVP.

## 10. Research sources

Research was conducted against the public product information of Magicbricks, Housing.com, NoBroker and Sell.Do in October 2026. The repository documentation should describe these observations as market research, not as independently audited claims about market share, performance or product completeness.
