# UniClubs – Technical Architecture Document

## Version 1.0 · 2026-05-13

**Technology Stack:** React · Node.js · PostgreSQL · Gemini API  
**Architecture Style:** Modular Monolith with Isolated Service Boundaries, Containerised Deployment

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Architectural Principles & Goals](#2-architectural-principles--goals)
3. [High‑Level System Architecture](#3-high-level-system-architecture)
4. [Component View](#4-component-view)
   - 4.1 Frontend Application (React)
   - 4.2 Backend for Frontend (BFF) Layer
   - 4.3 Core API Services (Node.js / Express)
   - 4.4 AI Integration Layer (Gemini)
   - 4.5 Data Layer (PostgreSQL, Redis)
   - 4.6 External Services Integration
5. [Data Architecture](#5-data-architecture)
6. [Security Architecture](#6-security-architecture)
7. [Deployment & Infrastructure](#7-deployment--infrastructure)
8. [Non‑Functional Requirements Mapping](#8-non-functional-requirements-mapping)
   - 8.1 Performance & Scalability
   - 8.2 Availability & Disaster Recovery
   - 8.3 Monitoring & Observability
9. [Technology Stack & Libraries](#9-technology-stack--libraries)
10. [Risk & Mitigation](#10-risk--mitigation)

---

## 1. Introduction

This document describes the technical architecture of the **UniClubs** platform. It translates the previously defined functional, non‑functional, and data requirements into a concrete, backend‑first design using:

- **Frontend:** deferred for now; likely SPA later, but not part of the current backend phase
- **Backend:** Node.js with Express, RESTful APIs
- **Database:** PostgreSQL (primary store) accessed through the `pg` library, plus Redis for caching & sessions
- **AI:** Google Gemini API (moderation, recommendations, report generation, sentiment analysis)

The architecture emphasises **multi‑tenancy**, **high availability**, **horizontal scalability**, and **security by design**, while keeping development and operations efficient through a modular monolith that can later be split into microservices.

---

## 2. Architectural Principles & Goals

| Principle                  | Implementation                                                                                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Separation of Concerns** | Frontend and backend are completely decoupled. Backend is organised by domain modules (club, event, user, content, analytics).                 |
| **Multi‑Tenancy first**    | Every database query includes a `university_id` context (set from JWT). Row‑Level Security (RLS) on PostgreSQL reinforces isolation.           |
| **API‑First Design**       | Backend exposes a versioned REST API (`/api/v1/...`). All frontend functionality is backed by these APIs.                                      |
| **Security by Default**    | OWASP countermeasures implemented; rate limiting on all endpoints; all secrets encrypted; JWT short‑lived tokens embedded in HttpOnly cookies. |
| **Graceful Degradation**   | If the Gemini AI is unavailable, content moderation falls back to manual queues and recommendations default to popularity‑based lists.         |
| **Performance**            | Client bundle < 500KB gzip; server response < 200ms for 95% of standard API calls; AI responses cached where appropriate.                      |
| **Infrastructure as Code** | Terraform for cloud resources; Docker Compose for local dev; CI/CD pipelines for zero‑downtime deployments.                                    |

---

## 3. High‑Level System Architecture

The system is divided into four tiers:

```
[Client: Frontend TBD, backend APIs first]
        |
        | HTTPS (TLS 1.3)
        v
[API Gateway / CDN (Cloudflare/AWS CloudFront)]
        |
        | Routes requests to backend
        v
[Backend (Node.js Express App)]
  - Auth Middleware (JWT validation + local credential auth)
  - Module Routers (Club, Event, Post, etc.)
  - AI Integration Layer (Gemini API client)
  - Caching Layer (Redis)
  - Database Layer (Postgres connection pool via pg)
        |
        | Internal network
        v
[Data Stores]
  - PostgreSQL (Primary, Read Replicas)
  - Redis (Session store, rate limiter, cache)
  - Object Storage (S3) for media files
        |
        | External HTTPS
        v
[External Services]
  - Optional future university SSO / identity federation
  - Gemini API
  - Email Service (SendGrid/AWS SES)
  - Calendar (iCal feeds)
```

A **Backend for Frontend (BFF)** pattern is not required in the current phase. The frontend will be decided later, so this architecture keeps the API surface ready for either a SPA or a future thin BFF if SEO/public pages need it.

---

## 4. Component View

### 4.1 Frontend Application (Deferred)

The frontend is intentionally not fixed in this phase. The backend API is being designed first, and the UI will later be implemented as either a SPA or another client pattern depending on product direction.

When the frontend is implemented, it is expected to use a modern React stack with client-side routing, API consumption, and accessible component patterns.

**Key Components Tree:**

```
<App>
  <AuthProvider>
    <NotificationProvider>
      <Router>
        <Layout>
          <Navbar />
          <Routes>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/clubs/*" element={<ClubRoutes />} />
            <Route path="/events/*" element={<EventRoutes />} />
            <Route path="/admin/*" element={<AdminRoutes />} />
            ...
          </Routes>
        </Layout>
      </Router>
    </NotificationProvider>
  </AuthProvider>
</App>
```

**Performance optimisations:**

- Code splitting per route.
- Images served via CDN with `srcset` and lazy loading.
- `React.memo` for pure components; `useMemo` for expensive computations.
- Virtualised lists for long tables (e.g., member roster).

### 4.2 Backend for Frontend (BFF) Layer

_Optional._ If server‑side rendering is required for SEO (public club pages, event details), a lightweight **Next.js** application could act as BFF. For V1, the SPA is sufficient; all data is fetched client‑side.

### 4.3 Core API Services (Node.js / Express)

- **Runtime:** Node.js 20 LTS.
- **Framework:** Express.js with `express‑async‑errors` for error handling.
- **Structure:** Modular monolith – all modules in the same Node.js process to reduce DevOps overhead, but with clear domain boundaries.
  - `/modules/auth` – login, token refresh, logout.
  - `/modules/users` – profile, preferences.
  - `/modules/clubs` – registration, profile, membership, roles.
  - `/modules/events` – CRUD, RSVP, attendance, check‑in.
  - `/modules/projects` – CRUD, likes.
  - `/modules/posts` – posts, comments, polls, moderation flags.
  - `/modules/notifications` – in‑app, email, digest logic.
  - `/modules/analytics` – aggregated queries, report generation.
  - `/modules/finance` – budget, transactions (optional feature).
  - `/modules/gamification` – badges, leaderboards.
  - `/modules/admin` – university oversight, system config.
- **Middleware Pipeline:**
  1. `helmet()` for security headers.
  2. `cors` configured per tenant origins.
  3. `express.json()` with size limits (10kb for notifications, 5MB for media uploads).
  4. `compression`.
  5. Request ID generation (`cls‑rtracer`).
  6. `rateLimiter` (global + per‑endpoint using Redis).
  7. `authMiddleware` – validates JWT from cookie/header, attaches `req.user` (id, university_id, roles).
  8. `tenantContext` – sets the current `university_id` for all downstream db operations.
  9. Route‑specific permission middleware (checks `req.user.roles` against required permissions).
  10. Business logic handlers.
  11. Global error handler.
- **API Conventions:**
  - Base URL: `/api/v1/`
  - Standard REST endpoints (e.g., `GET /api/v1/clubs`, `POST /api/v1/events/:id/rsvp`).
  - Consistent response envelope: `{ success: boolean, data: ... , error?: { code, message } }`.
  - Pagination via `?page=1&limit=20`; metadata returned in response header or `meta` field.
- **Real‑time:** Socket.io server attached to the HTTP server. Client subscribes to a personal room (`user:<uuid>`) for in‑app notifications; club moderators get updates on flagged content.

**Business Logic Implementation:**

- Each domain service is a class with clear interfaces, e.g., `ClubService`, `EventService`. They may emit events (e.g., `membership.approved`) to notify other modules via an internal event bus (Node.js `EventEmitter` or a lightweight pub/sub).
- All database access goes through **repository** objects using the **pg** library (`node-postgres`) for queries and parameterized SQL.
- Transactions are managed at the service layer using `pg` client transactions for operations spanning multiple tables (e.g., create event + initial schedule).

### 4.4 AI Integration Layer (Gemini API)

The platform uses **Google Gemini 1.5 Pro** (or latest available) for four distinct functions. A unified `AIService` class encapsulates all interactions, handling prompts, retries, and fallback.

#### 4.4.1 Content Moderation

- **Trigger:** Asynchronous after a new post or comment is created. The content stays hidden in an **under review** state until moderation completes.
- **Flow:**
  1. User creates a Post → backend saves it with `moderation_status = 'pending'` (if AI enabled).
  2. A background job (using BullMQ + Redis) picks up the task and sends the content to Gemini.
  3. Prompt engineering: We supply the text, a predefined set of violation categories (hate speech, profanity, harassment, doxxing), and ask Gemini to return a JSON object: `{ flagged: boolean, severity: "low"|"medium"|"high", categories: [...], explanation: "..." }`.
  4. Based on severity:
     - **High** → Post status set to `rejected`, author notified, flag logged, moderator alerted.
     - **Medium** → Post remains hidden in `under_review` and a `ModerationFlag` is created; moderator must review.
     - **Low** → Post moves from `under_review` to `approved` and is published.

  5. In case of Gemini API error (timeout, rate limit), fallback: all content stays in the manual moderation queue (`under_review`). The system will log the failure and alert ops.

- **Rate Limiting:** Max 10 requests/sec to Gemini API (configurable). Queue with concurrency control.

#### 4.4.2 Club Recommendations

- **Trigger:** Student requests “For You” recommendations on dashboard or explicitly. Pre‑computed daily for all active students via cron job.
- **Pre‑computation job (BullMQ):**
  - For each student, build a prompt containing:
    - Student interests (tags)
    - Past joined clubs
    - Attended event categories
    - Top tags of clubs they engaged with
    - Current semester (to weight active clubs).
  - Prompt instructs Gemini to return a ranked list of `club_id`s (max 5) with a short explanation for each.
  - The batch job calls Gemini with a list of clubs (ID, name, tags, category, member count, recent activity score) and the student profile. To avoid exceeding context limits, clubs are filtered beforehand to a candidate set (e.g., same major, recently active, or personal interest match) – passed as JSON array.
  - Gemini response parsed and stored in `recommendation_cache` table: `(user_id, club_id, score, explanation)`. The frontend fetches from this cache.
- **Fallback:** If Gemini fails, the system uses a simple scoring algorithm (tag overlap, popularity, recency) and marks explanations as generic.
- **Cold start:** New students are prompted to select interests; recommendations are generated immediately upon selection (sync call acceptable for onboarding flow).

#### 4.4.3 Activity Report Generation & Executive Summaries

- **Trigger:** Club officer requests a monthly activity report, or university admin triggers cross‑club summary.
- **Process:**
  - Backend aggregates numeric data from database: number of events, total attendance, membership change, projects completed, top posts engagement, etc.
  - This data is fed to Gemini along with club name, mission, and a structured prompt detailing the desired report sections (e.g., “Executive Summary”, “Events Review”, “Membership Trends”, “Highlights”, “Suggestions for Improvement”).
  - Gemini returns a Markdown‑formatted report draft.
  - The draft is stored in `club_activity_report` table and presented to the user for review/editing before publishing.
- **Fallback:** If AI is unavailable, a template‑based report with just numbers is generated.
- **Sentiment Analysis on Surveys:** When a survey has open‑text responses, a background job calls Gemini to summarise sentiments and extract themes. Results stored in `survey_insights`.

#### 4.4.4 Common AI Interaction Patterns

- **Prompt Management:** Prompts are stored in a separate configuration file (or database table) to allow tuning without code changes. Includes system roles and safety settings.
- **Context Window & Token Optimisation:** Large lists (clubs for recommendation) are stripped of redundant info; only essential fields sent.
- **API Key Rotation:** Stored in environment variables / secrets manager. Multiple keys can be used for load distribution if needed.
- **Observability:** Every AI request is logged with duration, tokens used, and status. A dashboard tracks costs and latencies.

### 4.5 Data Layer (PostgreSQL, Redis)

#### 4.5.1 PostgreSQL

- **Schema:** Follows the logical database design (UniClubs‑Logical‑DB v1.0). All tables are created via Knex migrations.
- **Connection Pooling:** `pg-pool` via Knex; pool size tuned per instance (typically 25-50). PgBouncer can be inserted for higher concurrency.
- **Read/Write Splitting:** Analytics queries and heavy reads directed to read replicas; writes to primary. Knex configured with multiple connection objects.
- **Full‑text Search:** For club and event search, PostgreSQL `tsvector` with GIN indexes. A dedicated search microservice (Elasticsearch) may be added later if needed.
- **Multi‑Tenancy Enforcement:** Every table has `university_id`. Post‑authenticated middleware injects the tenant ID; all repository methods automatically append `WHERE university_id = ?`. Row‑Level Security is also applied as a second layer: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` with policy `USING (university_id = current_setting('app.current_university_id')::uuid)`.
- **Data Retention & Archiving:** Partition large tables (e.g., `audit_log`, `notification`) by month. Automated jobs move old partitions to slower storage.

#### 4.5.2 Redis

- **Session Store:** User sessions (server‑side) linked to JWT. Revocation lists for refresh tokens.
- **Rate Limiting:** `express‑rate‑limit` with Redis store.
- **Caching:**
  - AI recommendations cached per user (TTL: 1 day).
  - Club profiles, public event lists (TTL: 5 min, invalidated on update via pub/sub).
  - Notification counts for quick badge display.
- **Job Queues:** BullMQ uses Redis for background processing (email, AI moderation, report generation).
- **Real‑time Pub/Sub:** Socket.io adapter uses Redis to scale horizontally (multiple Node instances).

#### 4.6 External Services Integration

- **University SSO:**
  - Kept as an optional future integration path. The first backend phase uses local credential auth instead.
  - If enabled later, the backend can map SSO attributes into existing user records and continue issuing JWTs for session management.
- **Email Service:**
  - Providers: SendGrid or AWS SES.
  - Transactional emails (RSVP confirm, moderation alerts) sent immediately via queue.
  - Digests compiled by a nightly cron and sent in batches.
- **Object Storage (Media):**
  - AWS S3 or equivalent.
  - Signed URLs for direct secure upload from frontend (pre‑signed POST).
  - Images processed via sharp for thumbnails.
- **Calendar Feeds:**
  - Backend generates iCalendar (`.ics`) feeds per club or user agenda.
  - Served via endpoint `GET /api/v1/clubs/:id/calendar.ics` with proper headers.

---

## 5. Data Architecture

Refer to the **UniClubs Logical Database Requirements** for entity details. The implementation will use:

- **Primary Keys:** UUIDs (v4) generated server‑side to avoid collisions across tenants.
- **Foreign Keys:** All properly indexed.
- **JSONB:** Used for flexible fields (custom RSVP questions, social links, permissions).
- **Migration Tool:** SQL migrations with version control, executed through the backend's pg-based data layer.
- **Database Diagrams:** Managed via a tool like dbdiagram.io or generated from migrations.

**Key Indexes:**

```sql
-- For public timeline
CREATE INDEX idx_posts_club_status_posted ON post(club_id, status, published_at DESC) WHERE status = 'published';
-- For event discovery
CREATE INDEX idx_events_university_visibility_start ON event(university_id, visibility, start_datetime) WHERE status = 'published';
-- RSVP lookup
CREATE UNIQUE INDEX idx_event_rsvp_user_unique ON event_rsvp(event_id, user_id);
-- Membership
CREATE INDEX idx_membership_user_status ON club_membership(user_id, status);
```

**Caching Strategy:**
| Data | Cache Location | TTL | Invalidation Trigger |
|------|----------------|-----|-----------------------|
| Club public profile | Redis | 5 min | Club profile updated event |
| Event details | Redis | 1 min | Event updated/cancelled |
| AI recommendations list per user | Redis | 86400 sec | Daily regeneration job |
| User session (refresh token) | Redis | according to token lifetime | Logout, revoke |

---

## 6. Security Architecture

- **Authentication:** Local login with email or student ID plus password for the current phase; backend issues access_token (15min) and refresh_token (1day) as JWE/JWT. Refresh tokens stored in Redis and can be revoked. SSO can be added later if needed.
- **Authorization:** Permission checks are enforced in each API route via a middleware that reads user role permissions from the database (or cached). No client‑side enforcement is trusted.
- **Data Protection:** All sensitive fields (email, student_id) encrypted at application level using AWS KMS or Vault; password hashes are stored instead of plaintext passwords.
- **API Security:**
  - Helmet.js for secure headers.
  - Input validation: `express-validator` library for every endpoint; Zod for complex objects.
  - Rate limiting: 100 req/min per user for general; 20 req/min for AI endpoints.
  - CORS whitelist per tenant origin.
- **Dependency Scanning:** Snyk / Dependabot integrated in CI/CD.
- **Secret Management:** Environment variables and HashiCorp Vault for production.

---

## 7. Deployment & Infrastructure

- **Containerisation:** Docker images for the Node.js backend. React app built as static files and served via CDN (S3 + CloudFront) or an Nginx container.
- **Orchestration:** Kubernetes (EKS/GKE) or simpler AWS ECS Fargate for container management.
- **Auto‑scaling:** HPA based on CPU/memory and custom metrics (request queue length). Minimum 3 replicas for high availability.
- **Database:** Managed PostgreSQL (AWS RDS / Cloud SQL) with Multi‑AZ for HA, automated backups, and read replicas.
- **Redis:** Managed ElastiCache (AWS) or Memorystore (GCP) with cluster mode for scalability.
- **CDN:** CloudFront or Fastly for static assets (React bundle, images) with edge caching.
- **CI/CD Pipeline:** GitHub Actions or GitLab CI:
  1. Build & test on pull requests.
  2. Build Docker image, push to ECR.
  3. Deploy to staging environment (approval gates).
  4. Run smoke tests.
  5. Promote to production via rolling update.
- **Environment Segregation:** Dev, Staging, Production. Staging uses anonymised data.

**Networking:**

- Backend and database in private subnets.
- API exposed through an internet‑facing Application Load Balancer (ALB) terminating TLS.
- Redis and DB only accessible from backend security group.

---

## 8. Non‑Functional Requirements Mapping

### 8.1 Performance & Scalability

- **Frontend:** Code splitting reduces initial bundle; lazy loading images; heavy components virtualised.
- **Backend:**
  - API response times: Use of connection pooling, proper indexing, Redis caching, and async processing for heavy tasks.
  - Horizontal scaling: Stateless services behind load balancer; sticky sessions not required (JWT in cookie).
  - Auto‑scaling policies: CPU > 70% triggers scale‑out; scale‑in during low traffic.
- **AI Latency:** Gemini calls have a timeout of 5 seconds; recommendations are pre‑cached; moderation is async (user sees “post under review” if queueing).
- **Database:** Read replicas for reporting; pgbouncer for connection management.

### 8.2 Availability & Disaster Recovery

- **Multi‑AZ Deployment:** All stateful components (DB, Redis) across availability zones.
- **Backups:** Automated daily snapshots with point‑in‑time recovery (7 days). Cross‑region backup for disaster recovery.
- **RTO/RPO:** Target RPO 1h, RTO 4h. DR plan tested quarterly.
- **Graceful Degradation Modes:**
  - Gemini down → manual moderation; recommendations algorithm fallback; AI reports replaced by template reports.
  - Redis down → in‑memory rate limiting (less accurate); socket.io falls back to polling; notifications delayed.
  - Database primary failure → automatic failover to standby (60s).

### 8.3 Monitoring & Observability

- **Logging:** Structured JSON logs (Winston) shipped to ELK stack or Datadog. Include trace ID, user ID (hashed), tenant ID.
- **Metrics:** Prometheus + Grafana for system metrics (CPU, memory, request rate, error rate, endpoint latency percentiles). Custom metrics: RSVP conversions, AI moderation counts, engagement rates.
- **Alerting:** PagerDuty / OpsGenie integration; alerts for high error rates, DB connection failures, Gemini API degradation.
- **Tracing:** OpenTelemetry for distributed tracing across API calls and background jobs.

---

## 9. Technology Stack & Libraries

**Backend:**

- Node.js 20
- Express.js
- pg (PostgreSQL driver, queries, pooling)
- Redis (ioredis)
- BullMQ (job queues)
- Socket.io (WebSocket)
- Passport.js (optional future SSO)
- jsonwebtoken
- bcrypt / argon2 (if local auth fallback)
- zod (validation schemas)
- express-rate-limit + rate-limit-redis
- helmet, cors, compression
- winston (logging)
- @google/generative-ai (Gemini SDK)
- aws-sdk (S3, SES)

**Frontend:**

- React 18
- TypeScript
- React Router 6
- TanStack React Query
- Zustand
- Axios
- React Hook Form + Zod
- Tailwind CSS + Headless UI
- react-i18next
- socket.io-client
- vite (build tool)
- vite-plugin-pwa
- Jest, React Testing Library, Playwright

**Infrastructure/DevOps:**

- Docker, Docker Compose (local dev)
- Kubernetes / ECS Fargate (prod)
- Terraform
- GitHub Actions
- Prometheus, Grafana
- ELK / Datadog

---

## 10. Risk & Mitigation

| Risk                                         | Impact                  | Mitigation                                                                       |
| -------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------- |
| Gemini API cost/latency overruns             | Budget, slow moderation | Aggressive caching, request batching, fallback algorithms, quota alerts          |
| Auth service downtime prevents login         | High                    | Keep local credential auth in the current phase; optional SSO can be added later |
| Data leakage across tenants                  | Critical                | RLS, application‑level tenant enforcement, automated integration tests           |
| High traffic during club fair crashes system | Medium                  | Auto‑scaling, load testing beforehand, ready CDN cache for static pages          |
| Frontend bundle size too large               | Poor UX on mobile       | Code splitting, lazy loading, regular bundle analysis (webpack-bundle-analyzer)  |

---

**Approvals**  
_This architecture is ready for technical review and subsequent implementation sprint planning._
