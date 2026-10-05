# EstateFlow - Backend Bootstrap Plan

## Spring Initializr
Project: Maven
Language: Java
Spring Boot: current stable 4.x
Group: com.estateflow
Artifact: estateflow-backend
Name: EstateFlow Backend
Package: com.estateflow
Java: 17

## Initial Dependencies
- Spring Web
- Spring Data JPA
- Spring Security
- Validation
- MySQL Driver
- Flyway Migration
- Lombok (optional; use conservatively)
- Spring Boot Actuator
- Spring Boot Test

Add after generation:
- JWT library
- springdoc-openapi
- Testcontainers MySQL

## First Backend Milestone
1. Generate project into `backend/`.
2. Confirm `mvnw.cmd test` succeeds.
3. Configure local MySQL through environment variables.
4. Add Flyway `V1__init_schema.sql`.
5. Establish common exception/error model.
6. Implement security only after schema/package skeleton is stable.

Do not commit passwords or local secrets. Commit an `.env.example` or documented environment variable names only.
