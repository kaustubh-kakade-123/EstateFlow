-- ============================================================
-- EstateFlow
-- V1 - Initial Database Schema
-- MySQL 8
-- ============================================================

-- =========================
-- USERS
-- =========================

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT uk_users_phone UNIQUE (phone)
);

CREATE INDEX idx_users_status
    ON users(status);


-- =========================
-- ROLES
-- =========================

CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name ENUM(
        'BUYER',
        'OWNER',
        'AGENT',
        'BUILDER',
        'ADMIN'
    ) NOT NULL,

    CONSTRAINT uk_roles_name UNIQUE (name)
);


-- =========================
-- USER ROLES
-- =========================

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,

    PRIMARY KEY (user_id, role_id),

    CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT fk_user_roles_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
);


-- =========================
-- PROPERTIES
-- =========================

CREATE TABLE properties (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    listed_by_user_id BIGINT NOT NULL,

    title VARCHAR(180) NOT NULL,
    description TEXT,

    property_type ENUM(
        'APARTMENT',
        'HOUSE',
        'VILLA',
        'PLOT',
        'OFFICE',
        'SHOP',
        'OTHER'
    ) NOT NULL,

    listing_type ENUM(
        'SALE',
        'RENT'
    ) NOT NULL,

    price DECIMAL(15,2) NOT NULL,
    area_sqft DECIMAL(10,2),

    bedrooms TINYINT UNSIGNED,
    bathrooms TINYINT UNSIGNED,
    parking_spaces TINYINT UNSIGNED,

    address_line VARCHAR(255),
    locality VARCHAR(120) NOT NULL,
    city VARCHAR(120) NOT NULL,
    state VARCHAR(120) NOT NULL,
    postal_code VARCHAR(20),

    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),

    status ENUM(
        'DRAFT',
        'PENDING_APPROVAL',
        'PUBLISHED',
        'REJECTED',
        'ARCHIVED'
    ) NOT NULL DEFAULT 'DRAFT',

    verified BOOLEAN NOT NULL DEFAULT FALSE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_properties_listed_by
        FOREIGN KEY (listed_by_user_id)
        REFERENCES users(id),

    CONSTRAINT chk_properties_price
        CHECK (price >= 0),

    CONSTRAINT chk_properties_area
        CHECK (area_sqft IS NULL OR area_sqft > 0)
);

CREATE INDEX idx_properties_status_city
    ON properties(status, city);

CREATE INDEX idx_properties_city_locality
    ON properties(city, locality);

CREATE INDEX idx_properties_property_type
    ON properties(property_type);

CREATE INDEX idx_properties_listing_type
    ON properties(listing_type);

CREATE INDEX idx_properties_price
    ON properties(price);

CREATE INDEX idx_properties_bedrooms
    ON properties(bedrooms);

CREATE INDEX idx_properties_listed_by
    ON properties(listed_by_user_id);


-- =========================
-- PROPERTY IMAGES
-- =========================

CREATE TABLE property_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    property_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,

    display_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_property_images_property
        FOREIGN KEY (property_id)
        REFERENCES properties(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_property_images_property
    ON property_images(property_id);


-- =========================
-- SHORTLISTS
-- =========================

CREATE TABLE shortlists (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT NOT NULL,
    property_id BIGINT NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_shortlists_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_shortlists_property
        FOREIGN KEY (property_id)
        REFERENCES properties(id)
        ON DELETE CASCADE,

    CONSTRAINT uk_shortlists_user_property
        UNIQUE (user_id, property_id)
);


-- =========================
-- ENQUIRIES
-- =========================

CREATE TABLE enquiries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    property_id BIGINT NOT NULL,
    buyer_user_id BIGINT NOT NULL,

    message VARCHAR(1000),

    source ENUM(
        'PROPERTY_PAGE',
        'SEARCH',
        'OTHER'
    ) NOT NULL DEFAULT 'PROPERTY_PAGE',

    status ENUM(
        'NEW',
        'PROCESSED',
        'CLOSED'
    ) NOT NULL DEFAULT 'NEW',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_enquiries_property
        FOREIGN KEY (property_id)
        REFERENCES properties(id),

    CONSTRAINT fk_enquiries_buyer
        FOREIGN KEY (buyer_user_id)
        REFERENCES users(id)
);

CREATE INDEX idx_enquiries_property
    ON enquiries(property_id);

CREATE INDEX idx_enquiries_buyer
    ON enquiries(buyer_user_id);

CREATE INDEX idx_enquiries_status
    ON enquiries(status);

CREATE INDEX idx_enquiries_created_at
    ON enquiries(created_at);


-- =========================
-- LEADS
-- =========================

CREATE TABLE leads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    enquiry_id BIGINT NOT NULL,
    assigned_agent_id BIGINT,

    stage ENUM(
        'NEW',
        'CONTACTED',
        'QUALIFIED',
        'VISIT_SCHEDULED',
        'VISIT_COMPLETED',
        'FOLLOW_UP',
        'NEGOTIATION',
        'CONVERTED',
        'LOST'
    ) NOT NULL DEFAULT 'NEW',

    priority ENUM(
        'LOW',
        'MEDIUM',
        'HIGH'
    ) NOT NULL DEFAULT 'MEDIUM',

    lost_reason VARCHAR(500),
    converted_at DATETIME,

    version BIGINT NOT NULL DEFAULT 0,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uk_leads_enquiry
        UNIQUE (enquiry_id),

    CONSTRAINT fk_leads_enquiry
        FOREIGN KEY (enquiry_id)
        REFERENCES enquiries(id),

    CONSTRAINT fk_leads_agent
        FOREIGN KEY (assigned_agent_id)
        REFERENCES users(id)
);

CREATE INDEX idx_leads_stage
    ON leads(stage);

CREATE INDEX idx_leads_agent
    ON leads(assigned_agent_id);

CREATE INDEX idx_leads_agent_stage
    ON leads(assigned_agent_id, stage);

CREATE INDEX idx_leads_priority
    ON leads(priority);

CREATE INDEX idx_leads_created_at
    ON leads(created_at);


-- =========================
-- LEAD ACTIVITIES
-- =========================

CREATE TABLE lead_activities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    lead_id BIGINT NOT NULL,
    performed_by_user_id BIGINT NOT NULL,

    activity_type ENUM(
        'CREATED',
        'ASSIGNED',
        'STAGE_CHANGED',
        'NOTE_ADDED',
        'FOLLOW_UP_CREATED',
        'VISIT_SCHEDULED',
        'VISIT_UPDATED'
    ) NOT NULL,

    description VARCHAR(1000) NOT NULL,

    old_stage VARCHAR(40),
    new_stage VARCHAR(40),

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_lead_activities_lead
        FOREIGN KEY (lead_id)
        REFERENCES leads(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_lead_activities_user
        FOREIGN KEY (performed_by_user_id)
        REFERENCES users(id)
);

CREATE INDEX idx_lead_activities_lead_created
    ON lead_activities(lead_id, created_at);


-- =========================
-- FOLLOW UPS
-- =========================

CREATE TABLE follow_ups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    lead_id BIGINT NOT NULL,
    assigned_to_user_id BIGINT NOT NULL,

    scheduled_at DATETIME NOT NULL,

    status ENUM(
        'PENDING',
        'COMPLETED',
        'CANCELLED'
    ) NOT NULL DEFAULT 'PENDING',

    note VARCHAR(1000),
    completed_at DATETIME,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_follow_ups_lead
        FOREIGN KEY (lead_id)
        REFERENCES leads(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_follow_ups_assigned_user
        FOREIGN KEY (assigned_to_user_id)
        REFERENCES users(id)
);

CREATE INDEX idx_follow_ups_agent_status_schedule
    ON follow_ups(
        assigned_to_user_id,
        status,
        scheduled_at
    );

CREATE INDEX idx_follow_ups_lead
    ON follow_ups(lead_id);


-- =========================
-- SITE VISITS
-- =========================

CREATE TABLE site_visits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    lead_id BIGINT NOT NULL,
    scheduled_by_user_id BIGINT NOT NULL,

    scheduled_at DATETIME NOT NULL,

    status ENUM(
        'SCHEDULED',
        'COMPLETED',
        'CANCELLED',
        'NO_SHOW'
    ) NOT NULL DEFAULT 'SCHEDULED',

    feedback VARCHAR(1500),
    completed_at DATETIME,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_site_visits_lead
        FOREIGN KEY (lead_id)
        REFERENCES leads(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_site_visits_scheduled_by
        FOREIGN KEY (scheduled_by_user_id)
        REFERENCES users(id)
);

CREATE INDEX idx_site_visits_status_schedule
    ON site_visits(status, scheduled_at);

CREATE INDEX idx_site_visits_lead
    ON site_visits(lead_id);