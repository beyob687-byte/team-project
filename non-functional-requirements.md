# UniClubs – Non-Functional Requirements

**Version:** 1.0  
**Date:** 2026-05-13

---

## 1. Introduction

This document defines the non-functional requirements (NFRs) for the UniClubs platform. These requirements specify the quality attributes, constraints, and operational characteristics that the system must exhibit, complementing the functional requirements. They are organized by category and are intended to be measurable and testable where possible.

---

## 2. Performance

### 2.1 Response Time

- **Page Load Time:** Initial page load under normal network conditions (4G/Wi-Fi) shall not exceed 3 seconds for authenticated users (First Contentful Paint ≤ 1.8s, Time to Interactive ≤ 3.5s).
- **API Response Time:** 95th percentile of server-side API responses must be:
  - ≤ 200 ms for simple queries (e.g., retrieving club profiles, event lists, notification counts).
  - ≤ 500 ms for complex queries (e.g., aggregated analytics, dashboard charts).
  - ≤ 2 seconds for AI-generated content (moderation check, recommendation response, report generation). AI moderation pre-posting must complete within 2 seconds.
- **Search & Filtering:** Search queries across clubs, events, and posts must return results within 300 ms (95th percentile) for up to 10,000 entities.

### 2.2 Throughput & Concurrency

- The system shall support at least 50,000 concurrent users across all tenants, with ability to scale horizontally.
- At peak event registration times (e.g., club fair), the RSVP and membership request endpoints must handle 5,000 requests per second without degradation beyond defined response times.
- Real-time notification delivery via WebSocket shall handle 10,000 simultaneous connections per node with message delivery latency ≤ 1 second.

### 2.3 Resource Utilization

- Client-side: The single-page application bundle (including PWA) shall not exceed 500 KB (compressed) initial load; lazy-loaded modules under 200 KB each.
- Server-side: Memory and CPU usage per instance shall remain below 70% under peak load with auto-scaling rules in place.

---

## 3. Scalability

### 3.1 Horizontal Scaling

- All backend services must be stateless or share state via a distributed cache/session store to allow horizontal replication.
- The platform shall support automatic scaling based on CPU/memory/request queue metrics.
- Database must support read replicas for analytics and heavy read workloads.

### 3.2 Multi-Tenancy

- The system shall isolate each university’s data logically (row-level security) or optionally physically (schema-per-tenant) depending on deployment.
- New university onboarding shall not require code changes; provisioning must be achievable via configuration within 2 hours.

### 3.3 Elasticity

- During major events (e.g., start of semester, club fairs), the system must be able to double capacity within 5 minutes of auto-scaling trigger.

---

## 4. Availability & Reliability

### 4.1 Uptime

- The platform must achieve 99.9% uptime (excluding planned maintenance) measured monthly.
- Planned maintenance windows shall be announced at least 48 hours in advance, preferably during low-activity periods (e.g., 2–5 AM local server time).

### 4.2 Fault Tolerance

- No single point of failure: critical components (web servers, API gateways, databases, AI model endpoints) must be deployed across multiple availability zones.
- In case of database primary failure, automatic failover to a standby replica must occur within 60 seconds.

### 4.3 Data Durability & Backups

- All user-generated content and transactional data must be backed up daily with point-in-time recovery capability for the last 7 days.
- Backups must be stored in a geographically separate region and encrypted at rest.
- Recovery Point Objective (RPO): 1 hour; Recovery Time Objective (RTO): 4 hours for full service restoration.

### 4.4 Graceful Degradation

- If AI moderation service becomes unavailable, the system shall fall back to placing all new content into a moderation queue (manual review required) rather than failing.
- If recommendation engine is down, the “For You” feed defaults to a popularity-based list without affecting core club/event features.

---

## 5. Security

### 5.1 Authentication & Authorization

- Support local authentication with email or student ID number plus password for the initial release; optional future SAML 2.0, OAuth 2.0, or OpenID Connect integration can be added later.
- All authentication tokens (JWT) must be short-lived (access: 15 min, refresh: 24h) and stored securely (HttpOnly, Secure cookies).
- Multi-factor authentication (MFA) must be enforced for all University Admin accounts and optionally for officers (configurable per tenant).

### 5.2 Authorization

- Role-based access control (RBAC) with fine-grained permissions as defined in functional requirements must be consistently enforced server-side on every request.
- Administrative actions must be additionally protected by re-authentication for critical operations (suspending a club, deleting data).

### 5.3 Data Protection

- Data in transit must be encrypted using TLS 1.3 (at minimum TLS 1.2 with strong cipher suites).
- All sensitive data at rest (user PII, passwords, financial records, moderation logs) must be encrypted using AES-256.
- Passwords must be hashed with bcrypt/argon2 (work factor ≥ 12).

### 5.4 Vulnerability Management

- Follow OWASP Top 10 protections; conduct regular static/dynamic code analysis and penetration testing at least semi-annually.
- Apply critical security patches within 7 days of availability.
- Content Security Policy (CSP), X-Frame-Options, and other security headers must be deployed.

### 5.5 API Security

- Rate limiting on all public and authenticated endpoints to prevent abuse:
  - 100 requests/minute per user for general endpoints.
  - 20 requests/minute for AI moderation/recommendation endpoints.
- Input validation and sanitization on all incoming data to prevent injection attacks.

---

## 6. Data Privacy & Compliance

### 6.1 Privacy Regulations

- The system must comply with GDPR (EU), CCPA (California), FERPA (US educational records, if applicable), and other relevant regulations as configured per university tenant.
- Personal data must be processed and stored within the data residency boundaries specified by the university (region/country selection at provisioning).

### 6.2 Data Minimization & Control

- Students can delete their own account; this must anonymize or remove all personal content (posts, comments) within 30 days, while preserving aggregate statistics.
- User consent management: clear opt-in for AI recommendations, email communication, and demographic data collection for analytics.
- Data retention policies must be configurable per tenant (e.g., archive inactive club data after 3 years of inactivity).

### 6.3 Audit & Logging

- All access to and modification of PII must be logged and immutable.
- Audit logs must be retained for a minimum of 2 years and be exportable for compliance reviews.

---

## 7. Usability & Accessibility

### 7.1 Accessibility

- The web interface must conform to **WCAG 2.1 Level AA** standards:
  - Sufficient color contrast (4.5:1 for normal text).
  - Full keyboard navigability.
  - Screen reader compatibility (ARIA labels, semantic HTML).
  - Captions and transcripts for any platform-hosted video content.
- An accessibility statement page shall be reachable from the footer.

### 7.2 Responsive Design & Device Support

- The platform must be fully responsive, providing optimal experience on devices from 320px width smartphones to 4K desktops.
- All core features (event registration, check-in, notifications, club browsing) must operate on mobile browsers without requiring a separate app.
- PWA capabilities (offline caching for previously loaded pages, push notifications, home screen installation) shall be available.

### 7.3 Internationalization (i18n)

- The user interface must support multiple languages; language switching must be instantaneous.
- Initially support English; architecture must allow easy addition of translations via locale files.
- AI-generated content (explanations, summaries) should ideally be in the user’s selected language (configurable).

### 7.4 User Experience Consistency

- Design system with reusable components; consistent color scheme, typography, and interaction patterns across the platform.
- Error messages must be user-friendly and avoid revealing technical details.

---

## 8. Maintainability & Extensibility

### 8.1 Code & Architecture

- Microservices or modular monolith architecture with well-defined APIs (REST/gRPC) to allow independent development and deployment of components (clubs, events, moderation, AI).
- Clear separation of concerns; business logic shall be framework-agnostic where feasible.
- Code coverage (unit tests) must be at least 80% for backend services.

### 8.2 Configuration Management

- Feature flags shall allow enabling/disabling modules (AI moderation, financial management, gamification) per university without redeployment.
- All environment-specific configurations (SSO endpoints, theme colors, data residency) must be externalized.

### 8.3 Documentation

- Comprehensive API documentation (OpenAPI/Swagger) for all public/internal endpoints.
- Admin and user manuals; developer quickstart guide for contributing.

### 8.4 Automation

- CI/CD pipelines must be in place for automated testing, integration tests, and zero-downtime deployments.
- Infrastructure as Code (Terraform/CloudFormation) for reproducible environments.

---

## 9. Interoperability & Integration

### 9.1 University Systems

- SSO/LDAP: Optional future integration; ability to map university user attributes (student ID, email, department) to UniClubs profile if enabled later.
- Calendar: Provide standard iCalendar feeds for club/event calendars that can be consumed by Google Calendar, Outlook, etc.

### 9.2 External Services

- LMS integration (e.g., Canvas, Moodle) via LTI standard for academic clubs (optional module).
- Payment gateway integration (for club dues, event fees) with PCI-DSS compliance if activated.

### 9.3 API & Extensibility

- Public REST API for clubs to programmatically manage their data (with token-based auth).
- Webhooks for event notifications (e.g., new member joined, event created) that external systems can subscribe to.

---

## 10. AI/ML Specific Requirements

### 10.1 Model Performance & Accuracy

- **Content Moderation:**
  - False Positive Rate (flagging non-violative content as violation): < 5%.
  - False Negative Rate (missing actual violations): < 1% on hate speech/slurs and threats.
  - Bias assessment: Must be tested for racial, gender, and dialect bias quarterly; no demographic group shall have a false positive rate > 2× the average.
- **Recommendation Engine:**
  - Click-through rate (CTR) on recommendations must be at least 15% higher than a random baseline.
  - Coverage: At least 90% of clubs should appear in recommendations when relevant.

### 10.2 Latency & Availability

- AI model inference for moderation must complete within 2 seconds for 95th percentile.
- AI recommendation engine must refresh user recommendations daily within a 2-hour batch window; the response for pre-computed recommendations must be near-instant (≤ 50ms).
- Model endpoints must have redundancy; degraded service with fallback as described in availability.

### 10.3 Explainability & Transparency

- For moderation flags, the system must provide a brief reason label (e.g., “hate speech detected”) visible to the content author and moderators.
- For recommendations, a short personalized explanation snippet must be displayed (“Because you’re in CS and attend hackathons”).
- Users must be able to report “wrong recommendation” or “wrong flag” as feedback.

### 10.4 Human-in-the-Loop

- Moderators can correct AI decisions (override); these corrections must be fed back into model retraining pipeline (supervised fine-tuning) at least monthly.
- Admin dashboard must show statistics on moderation accuracy and recommendation engagement.

### 10.5 Data & Model Governance

- Training data must be reviewed for privacy compliance; no student PII used to train external models without explicit consent.
- Model versioning: Every deployed model must have a version tag; rollback capability to previous version required if performance degrades.

---

## 11. Legal & University Policy Compliance

### 11.1 Records Retention

- Financial records: retain 7 years (or per university policy configurable).
- Moderation and disciplinary logs: retain for duration of student enrollment plus 2 years.
- Automatic purging mechanism for expired data.

### 11.2 Acceptable Use

- Enforcement of university Acceptable Use Policy via configurable terms of service agreement before account activation; must be re-accepted on updates.

### 11.3 Copyright & IP

- The platform must provide mechanisms for reporting copyright infringement (DMCA) and act accordingly.

---

## 12. Operational & Deployment

### 12.1 Monitoring & Alerting

- Real-time monitoring of infrastructure (CPU, memory, disk), application performance (response times, error rates), and business metrics (registrations, flags per hour).
- Alerts must be triggered for anomalies and sent to operations team via multiple channels (email, SMS, PagerDuty).
- Uptime monitoring and public status page.

### 12.2 Logging

- Centralized structured logging (JSON) for all services; logs must be searchable and retained for at least 30 days (hot) and 6 months (cold).
- Access log containing user ID, action, timestamp, IP address for security auditing.

### 12.3 Deployment

- Zero-downtime deployments (blue/green or rolling updates) mandatory for production.
- Separate staging environment with anonymized data for testing before releases.

### 12.4 Disaster Recovery

- Documented and tested disaster recovery plan; annual simulation required.
- Cross-region failover capability for critical infrastructure.

---

## 13. Network & Browser Support

### 13.1 Browser Compatibility

- Support the latest two major versions of Chrome, Firefox, Safari, Edge, and mobile browsers (iOS Safari, Android Chrome).
- Graceful degradation for older browsers (IE11 not supported).

### 13.2 Bandwidth & Offline

- Core features should function on 3G connections; images must be lazy-loaded and compressed (WebP format with JPEG fallback).
- PWA service worker to cache shell resources and allow viewing of previously loaded pages/events offline.

---

## 14. Quality Assurance Constraints

### 14.1 Test Coverage

- At least 80% unit test coverage for critical business logic.
- Automated end-to-end tests for all core user journeys (registration, RSVP, content posting, admin reporting).
- Load and stress testing before major releases and start-of-semester.

### 14.2 Bug Severity

- Critical bugs (data loss, security breach, major feature down) must be resolved within 4 hours of confirmation.
- High severity (broken core feature with workaround) within 24 hours.

---

**End of Document**
