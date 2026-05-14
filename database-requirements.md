# UniClubs – Logical Database Requirements

**Version:** 1.0  
**Date:** 2026-05-13

---

## 1. Introduction

This document defines the **logical data model** for the UniClubs platform. It describes the entities (tables), their attributes, primary/foreign keys, constraints, and relationships needed to support all functional requirements, from initial user authentication to every module: clubs, memberships, events, projects, content, moderation, notifications, analytics, and more.

The model follows a **multi-tenant architecture**, where each university (tenant) has its own isolated set of application data, enforced by a `university_id` column in nearly every table. Row-level security policies are applied to guarantee logical isolation.

All entities are in **3rd Normal Form (3NF)** unless a deliberate denormalization has been applied for performance or reporting.

---

## 2. Core Entity-Relationship Overview

The database revolves around the following core entities:

- **University** – tenancy anchor.
- **User** – universal account linked to a university through local account credentials, with optional future identity federation support.
- **Club** – a registered student organization.
- **ClubMembership** – junction between User and Club with role and status.
- **ClubRole** – predefined and custom officer roles with permissions (can be static definitions or dynamic per club).
- **Project** – club project/portfolio entry.
- **Event** – an event hosted by a club.
- **EventRSVP** – student registration for an event.
- **AttendanceRecord** – check-in record for a user at an event.
- **Post** – club communication post (can be of type general, poll, event, project).
- **Comment** – user comment on a post or project.
- **ModerationFlag** – AI-generated or user-reported content flagging.
- **Notification** – in-app and email notifications.
- **Achievement** / **UserAchievement** – gamification badges.

Supporting entities: media attachments, tags, polls, polls options, votes, survey, question, response, budget, transaction, audit logs, etc.

The model is split into functional schemas (logical namespaces) for clarity.

---

## 3. Detailed Entity Definitions

### 3.1 Authentication, University & User Profile

#### 3.1.1 **University**

_Represents a participating university (tenant)._

| Attribute    | Type         | Constraints           | Description                                         |
| ------------ | ------------ | --------------------- | --------------------------------------------------- |
| `id`         | UUID         | PK                    | Unique identifier                                   |
| `name`       | VARCHAR(200) | NOT NULL              | Official name                                       |
| `short_name` | VARCHAR(50)  | UNIQUE                | Abbreviation (e.g., "MIT")                          |
| `domain`     | VARCHAR(255) | NOT NULL, UNIQUE      | Email domain for auto-association (e.g., "mit.edu") |
| `logo_url`   | VARCHAR(500) | NULL                  | University branding                                 |
| `active`     | BOOLEAN      | NOT NULL DEFAULT TRUE | Soft delete/disable                                 |
| `created_at` | TIMESTAMP    | DEFAULT NOW()         |                                                     |
| `settings`   | JSONB        | NULL                  | Feature flags, data residency, retention policies   |

#### 3.1.2 **User**

_Every person who logs in. One user can belong to only one university (in this model). Local account credentials are captured at signup, with optional external identity fields reserved for future integrations._

| Attribute                  | Type                              | Constraints                          | Description                                               |
| -------------------------- | --------------------------------- | ------------------------------------ | --------------------------------------------------------- |
| `id`                       | UUID                              | PK                                   |                                                           |
| `university_id`            | UUID                              | FK → University.id, NOT NULL         | Tenant anchor                                             |
| `password_hash`            | VARCHAR(255)                      | NOT NULL                             | Hashed password for local login                           |
| `email`                    | VARCHAR(320)                      | NOT NULL, UNIQUE (within university) | Verified email                                            |
| `first_name`               | VARCHAR(100)                      | NOT NULL                             |                                                           |
| `last_name`                | VARCHAR(100)                      | NOT NULL                             |                                                           |
| `student_id`               | VARCHAR(50)                       | NULL                                 | University enrollment number (if student)                 |
| `external_auth_id`         | VARCHAR(255)                      | NULL                                 | Optional future SSO or identity federation reference      |
| `user_type`                | ENUM('student','faculty','staff') | NOT NULL                             | Primary affiliation                                       |
| `major`                    | VARCHAR(100)                      | NULL                                 | For students                                              |
| `department`               | VARCHAR(100)                      | NULL                                 | For faculty/staff                                         |
| `enrollment_status`        | VARCHAR(20)                       | NULL                                 | 'active', 'alumni', 'graduated', etc.                     |
| `profile_image_url`        | VARCHAR(500)                      | NULL                                 |                                                           |
| `bio`                      | TEXT                              | NULL                                 |                                                           |
| `interests`                | TEXT[]                            | NULL                                 | Tags for AI recommendations (e.g., ["coding","robotics"]) |
| `privacy_profile_visible`  | BOOLEAN                           | DEFAULT TRUE                         | Show profile to members                                   |
| `privacy_roster_visible`   | BOOLEAN                           | DEFAULT TRUE                         | Appear on club rosters                                    |
| `allow_ai_recommend`       | BOOLEAN                           | DEFAULT TRUE                         | Opt-in for AI                                             |
| `notification_preferences` | JSONB                             | DEFAULT '{}'                         | Email/in-app toggles per category                         |
| `is_active`                | BOOLEAN                           | DEFAULT TRUE                         | Soft disable                                              |
| `created_at`               | TIMESTAMP                         | DEFAULT NOW()                        |                                                           |
| `last_login`               | TIMESTAMP                         | NULL                                 |                                                           |

- **Indexes:** `(university_id, email) UNIQUE`, `(university_id, student_id) UNIQUE`.

#### 3.1.3 **UserSession (optional/not persistent)**

Managed via token/refresh system; not required in main model.

---

### 3.2 Club Profile & Registration

#### 3.2.1 **Club**

_Club entity holding profile details._

| Attribute               | Type                                            | Constraints                     | Description                         |
| ----------------------- | ----------------------------------------------- | ------------------------------- | ----------------------------------- |
| `id`                    | UUID                                            | PK                              |                                     |
| `university_id`         | UUID                                            | FK → University.id, NOT NULL    | Tenant                              |
| `name`                  | VARCHAR(200)                                    | NOT NULL, UNIQUE per university | Full club name                      |
| `short_name`            | VARCHAR(50)                                     | UNIQUE per university           | Abbreviation                        |
| `category`              | VARCHAR(50)                                     | NOT NULL                        | Primary category (enum)             |
| `secondary_categories`  | TEXT[]                                          | NULL                            | Additional categories               |
| `mission_statement`     | TEXT                                            | NULL                            |                                     |
| `logo_url`              | VARCHAR(500)                                    | NULL                            |                                     |
| `cover_photo_url`       | VARCHAR(500)                                    | NULL                            |                                     |
| `contact_email`         | VARCHAR(320)                                    | NOT NULL                        | Public/official email               |
| `social_links`          | JSONB                                           | NULL                            | {instagram, discord, linkedin, ...} |
| `membership_policy`     | ENUM('open','approval','invite_only')           | NOT NULL DEFAULT 'approval'     |                                     |
| `recruiting_status`     | BOOLEAN                                         | DEFAULT TRUE                    | Show "Actively Recruiting"          |
| `status`                | ENUM('pending','active','suspended','inactive') | NOT NULL DEFAULT 'pending'      | Registration state                  |
| `constitution_url`      | VARCHAR(500)                                    | NULL                            | Uploaded document URL               |
| `faculty_advisor_name`  | VARCHAR(100)                                    | NULL                            |                                     |
| `faculty_advisor_email` | VARCHAR(320)                                    | NULL                            |                                     |
| `meeting_schedule`      | JSONB                                           | NULL                            | {day, time, location, frequency}    |
| `tags`                  | TEXT[]                                          | NULL                            | Searchable keywords                 |
| `created_at`            | TIMESTAMP                                       | DEFAULT NOW()                   |                                     |
| `updated_at`            | TIMESTAMP                                       |                                 |                                     |

- **Club registration requests** are handled through an administrative workflow. Requests may be imported or entered by a university admin and tracked with `status = 'pending'` plus optional metadata in a `ClubRegistrationRequest` table.

#### 3.2.2 **ClubMediaGallery**

_Stores additional images/videos for club profile._

| Attribute    | Type                  | Constraints                    |
| ------------ | --------------------- | ------------------------------ |
| `id`         | UUID                  | PK                             |
| `club_id`    | UUID                  | FK → Club.id ON DELETE CASCADE |
| `media_url`  | VARCHAR(500)          | NOT NULL                       |
| `media_type` | ENUM('image','video') | NOT NULL                       |
| `caption`    | VARCHAR(300)          | NULL                           |
| `sort_order` | INT                   | DEFAULT 0                      |

#### 3.2.3 **ClubRegistrationRequest** (if tracking workflow)

_May be replaced by Club with status 'pending' + a separate table for admin actions._

| Attribute              | Type                                                | Constraints             |
| ---------------------- | --------------------------------------------------- | ----------------------- |
| `id`                   | UUID                                                | PK                      |
| `club_id`              | UUID                                                | FK → Club.id (unique)   |
| `requested_by_user_id` | UUID                                                | FK → User.id            |
| `submitted_at`         | TIMESTAMP                                           |                         |
| `status`               | ENUM('pending','approved','rejected','conditional') | NOT NULL                |
| `admin_user_id`        | UUID                                                | FK → User.id (reviewer) |
| `admin_notes`          | TEXT                                                | NULL                    |
| `resolved_at`          | TIMESTAMP                                           |                         |

---

### 3.3 Membership & Roles

#### 3.3.1 **ClubMembership**

_Junction table linking users to clubs with role and status._

| Attribute    | Type                                          | Constraints               |
| ------------ | --------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`         | UUID                                          | PK                        |
| `user_id`    | UUID                                          | FK → User.id              |
| `club_id`    | UUID                                          | FK → Club.id              |
| `role`       | VARCHAR(50)                                   | NOT NULL DEFAULT 'member' | 'president', 'vice_president', 'secretary', 'treasurer', 'event_coordinator', 'pr_officer', 'content_moderator', 'member', 'alumni', custom role slug |
| `status`     | ENUM('active','pending','suspended','alumni') | NOT NULL DEFAULT 'active' |
| `join_date`  | TIMESTAMP                                     | DEFAULT NOW()             |
| `left_date`  | TIMESTAMP                                     | NULL                      | If member left voluntarily or removed                                                                                                                 |
| `invited_by` | UUID                                          | NULL                      | FK → User.id (for invite-only)                                                                                                                        |

- **Unique constraint:** `(user_id, club_id)` – a user can have only one membership record per club.
- For custom roles, a separate **ClubRolePermission** table allows dynamic permissions.

#### 3.3.2 **ClubRoleDefinition**

_Defines officer roles and permissions for a club._

| Attribute     | Type        | Constraints   |
| ------------- | ----------- | ------------- | ---------------------------------- |
| `id`          | UUID        | PK            |
| `club_id`     | UUID        | FK → Club.id  |
| `role_name`   | VARCHAR(50) | NOT NULL      | e.g., "president", "lead_designer" |
| `is_custom`   | BOOLEAN     | DEFAULT FALSE | Standard roles are seeded          |
| `permissions` | JSONB       | NOT NULL      | Map of module:actions (see below)  |

**Sample permissions JSON:**

```json
{
  "profile": ["edit"],
  "members": ["view", "approve", "remove"],
  "events": ["create", "edit", "delete"],
  "analytics": ["view"],
  "moderation": ["review"]
}
```

#### 3.3.3 **MembershipRequest**

_For clubs with approval policy._

| Attribute       | Type                                | Constraints                |
| --------------- | ----------------------------------- | -------------------------- |
| `id`            | UUID                                | PK                         |
| `user_id`       | UUID                                | FK → User.id               |
| `club_id`       | UUID                                | FK → Club.id               |
| `status`        | ENUM('pending','approved','denied') | NOT NULL DEFAULT 'pending' |
| `requested_at`  | TIMESTAMP                           | DEFAULT NOW()              |
| `action_by`     | UUID                                | FK → User.id (officer)     |
| `denial_reason` | TEXT                                | NULL                       |

---

### 3.4 Projects & Portfolio

#### 3.4.1 **Project**

_Club project entry._

| Attribute         | Type                                       | Constraints               |
| ----------------- | ------------------------------------------ | ------------------------- | ------------------ |
| `id`              | UUID                                       | PK                        |
| `club_id`         | UUID                                       | FK → Club.id              |
| `title`           | VARCHAR(200)                               | NOT NULL                  |
| `description`     | TEXT                                       | NULL                      |
| `start_date`      | DATE                                       | NULL                      |
| `end_date`        | DATE                                       | NULL                      |
| `status`          | ENUM('planning','in_progress','completed') | NOT NULL                  |
| `visibility`      | ENUM('public','members_only')              | NOT NULL DEFAULT 'public' |
| `cover_image_url` | VARCHAR(500)                               | NULL                      |
| `outcome`         | TEXT                                       | NULL                      | Summary of results |
| `created_by`      | UUID                                       | FK → User.id              |
| `created_at`      | TIMESTAMP                                  | DEFAULT NOW()             |

- **ProjectCollaborator** (optional): `project_id`, `user_id`, `role` (e.g., 'lead', 'contributor').
- **ProjectMedia** (similar to ClubMediaGallery): images, videos, PDFs.
- **ProjectExternalLink**: `project_id`, `url`, `label` (GitHub, Behance, etc.).

#### 3.4.2 **ProjectLike**

_Users can like/applaud a project._

| Attribute    | Type | Constraints           |
| ------------ | ---- | --------------------- |
| `project_id` | UUID | FK → Project.id       |
| `user_id`    | UUID | FK → User.id          |
| PRIMARY KEY  |      | (project_id, user_id) |

---

### 3.5 Events & RSVP

#### 3.5.1 **Event**

_Club event details._

| Attribute               | Type                                              | Constraints              |
| ----------------------- | ------------------------------------------------- | ------------------------ | ----------------------------------------- |
| `id`                    | UUID                                              | PK                       |
| `club_id`               | UUID                                              | FK → Club.id             |
| `title`                 | VARCHAR(200)                                      | NOT NULL                 |
| `description`           | TEXT                                              | NULL                     |
| `event_type`            | ENUM('in_person','virtual','hybrid')              | NOT NULL                 |
| `location`              | VARCHAR(300)                                      | NULL                     |
| `virtual_meeting_link`  | VARCHAR(500)                                      | NULL                     |
| `start_datetime`        | TIMESTAMP                                         | NOT NULL                 |
| `end_datetime`          | TIMESTAMP                                         | NOT NULL                 |
| `timezone`              | VARCHAR(50)                                       | DEFAULT 'UTC'            |
| `cover_image_url`       | VARCHAR(500)                                      | NULL                     |
| `visibility`            | ENUM('public','club_members','invite_only')       | NOT NULL                 |
| `rsvp_required`         | BOOLEAN                                           | DEFAULT FALSE            |
| `rsvp_opens_at`         | TIMESTAMP                                         | NULL                     |
| `rsvp_closes_at`        | TIMESTAMP                                         | NULL                     |
| `capacity`              | INT                                               | NULL                     | NULL = unlimited                          |
| `waitlist_enabled`      | BOOLEAN                                           | DEFAULT FALSE            |
| `custom_rsvp_questions` | JSONB                                             | NULL                     | Array of question objects                 |
| `checkin_method`        | JSONB                                             | NULL                     | {"manual":true, "qr": true, "geo": false} |
| `checkin_code`          | VARCHAR(20)                                       | NULL                     | One-time code for self check-in           |
| `status`                | ENUM('draft','published','cancelled','completed') | NOT NULL DEFAULT 'draft' |
| `created_by`            | UUID                                              | FK → User.id             |
| `created_at`            | TIMESTAMP                                         | DEFAULT NOW()            |

#### 3.5.2 **EventRSVP**

_Student registration for an event._

| Attribute           | Type                                                             | Constraints                   |
| ------------------- | ---------------------------------------------------------------- | ----------------------------- | --------------------------- |
| `id`                | UUID                                                             | PK                            |
| `event_id`          | UUID                                                             | FK → Event.id                 |
| `user_id`           | UUID                                                             | FK → User.id                  |
| `status`            | ENUM('registered','waitlisted','cancelled','attended','no_show') | NOT NULL DEFAULT 'registered' |
| `rsvp_submitted_at` | TIMESTAMP                                                        | DEFAULT NOW()                 |
| `response_data`     | JSONB                                                            | NULL                          | Answers to custom questions |
| `number_of_guests`  | INT                                                              | DEFAULT 0                     |
| `ticket_code`       | VARCHAR(50)                                                      | UNIQUE                        | QR code text for check-in   |

- Unique constraint: `(event_id, user_id)` – a user can have only one active registration per event (they can cancel and re-register, handled by status changes).

#### 3.5.3 **EventWaitlist** (could be derived from EventRSVP status='waitlisted' with position)

We use EventRSVP with `status='waitlisted'` and a position determined by `rsvp_submitted_at` ordering. However, for explicit waitlist position tracking, we could have a separate table, but unnecessary.

---

### 3.6 Attendance Tracking

#### 3.6.1 **AttendanceRecord**

_Records that a user attended (checked into) an event._

| Attribute        | Type                                       | Constraints   |
| ---------------- | ------------------------------------------ | ------------- | --------------------------------- |
| `id`             | UUID                                       | PK            |
| `event_id`       | UUID                                       | FK → Event.id |
| `user_id`        | UUID                                       | FK → User.id  |
| `rsvp_id`        | UUID                                       | NULL          | FK → EventRSVP.id (if registered) |
| `checkin_method` | ENUM('manual','qr_scan','geo','self_code') | NOT NULL      |
| `checkin_time`   | TIMESTAMP                                  | DEFAULT NOW() |
| `marked_by`      | UUID                                       | NULL          | FK → User.id (officer) for manual |

- User can be checked in even without prior RSVP (walk-in). In that case `rsvp_id` is NULL.

---

### 3.7 Communication: Posts, Comments, Polls

#### 3.7.1 **Post**

_Club-authored posts on timeline._

| Attribute           | Type                                                         | Constraints                                               |
| ------------------- | ------------------------------------------------------------ | --------------------------------------------------------- | ---------------------------------------- |
| `id`                | UUID                                                         | PK                                                        |
| `club_id`           | UUID                                                         | FK → Club.id                                              |
| `author_id`         | UUID                                                         | FK → User.id (officer)                                    |
| `post_type`         | ENUM('general','event_promotion','project_highlight','poll') | NOT NULL DEFAULT 'general'                                |
| `content`           | TEXT                                                         | NOT NULL                                                  | Rich text / markdown                     |
| `images`            | TEXT[]                                                       | NULL                                                      | Array of image URLs                      |
| `video_url`         | VARCHAR(500)                                                 | NULL                                                      |
| `linked_event_id`   | UUID                                                         | NULL                                                      | FK → Event.id (for event promotion card) |
| `linked_project_id` | UUID                                                         | NULL                                                      | FK → Project.id (for project highlight)  |
| `scheduled_at`      | TIMESTAMP                                                    | NULL                                                      | Null = published immediately             |
| `visibility`        | ENUM('public','members_only')                                | NOT NULL DEFAULT 'public'                                 |
| `moderation_status` | ENUM('pending','approved','rejected','quarantined')          | NOT NULL DEFAULT 'pending' if AI enabled, else 'approved' |
| `status`            | ENUM('draft','published','archived')                         | NOT NULL DEFAULT 'published'                              |
| `created_at`        | TIMESTAMP                                                    | DEFAULT NOW()                                             |
| `published_at`      | TIMESTAMP                                                    | NULL                                                      |

#### 3.7.2 **Comment**

_User comments on posts or projects._

| Attribute           | Type                                  | Constraints                |
| ------------------- | ------------------------------------- | -------------------------- | ------------------------------------ |
| `id`                | UUID                                  | PK                         |
| `commentable_type`  | VARCHAR(20)                           | NOT NULL                   | 'Post' or 'Project'                  |
| `commentable_id`    | UUID                                  | NOT NULL                   | FK to Post.id or Project.id          |
| `user_id`           | UUID                                  | FK → User.id               |
| `parent_comment_id` | UUID                                  | NULL                       | FK → Comment.id (for nested replies) |
| `content`           | TEXT                                  | NOT NULL                   |
| `moderation_status` | ENUM('pending','approved','rejected') | NOT NULL DEFAULT 'pending' |
| `created_at`        | TIMESTAMP                             | DEFAULT NOW()              |

#### 3.7.3 **Poll** (if separate from Post)

| Attribute            | Type                                      | Constraints                        |
| -------------------- | ----------------------------------------- | ---------------------------------- |
| `id`                 | UUID                                      | PK                                 |
| `post_id`            | UUID                                      | FK → Post.id (unique if poll post) |
| `question`           | VARCHAR(500)                              | NOT NULL                           |
| `expires_at`         | TIMESTAMP                                 | NULL                               |
| `results_visibility` | ENUM('always','after_vote','after_close') | NOT NULL                           |
| `multiple_choice`    | BOOLEAN                                   | DEFAULT FALSE                      |

#### 3.7.4 **PollOption**

| Attribute     | Type         |
| ------------- | ------------ | ------------ |
| `id`          | UUID         | PK           |
| `poll_id`     | UUID         | FK → Poll.id |
| `option_text` | VARCHAR(200) | NOT NULL     |
| `sort_order`  | INT          |

#### 3.7.5 **PollVote**

| Attribute    | Type      |
| ------------ | --------- | ----------------------------------------------------------------------------- |
| `id`         | UUID      | PK                                                                            |
| `poll_id`    | UUID      | FK → Poll.id                                                                  |
| `option_id`  | UUID      | FK → PollOption.id                                                            |
| `user_id`    | UUID      | FK → User.id                                                                  |
| `created_at` | TIMESTAMP |
| UNIQUE       |           | (poll_id, user_id) if not multiple_choice; else (poll_id, option_id, user_id) |

---

### 3.8 Content Moderation

#### 3.8.1 **ModerationFlag**

_Records AI-flagged or user-reported content._

| Attribute         | Type                                                                | Constraints                |
| ----------------- | ------------------------------------------------------------------- | -------------------------- | --------------------------------------- |
| `id`              | UUID                                                                | PK                         |
| `content_type`    | VARCHAR(20)                                                         | NOT NULL                   | 'Post', 'Comment', 'Project'            |
| `content_id`      | UUID                                                                | NOT NULL                   |
| `reported_by`     | UUID                                                                | NULL                       | FK → User.id if user report; NULL if AI |
| `ai_confidence`   | DECIMAL(3,2)                                                        | NULL                       | 0.00-1.00 if AI                         |
| `ai_reason`       | VARCHAR(100)                                                        | NULL                       | e.g., "hate_speech", "profanity"        |
| `flag_type`       | ENUM('ai_auto','user_report')                                       | NOT NULL                   |
| `status`          | ENUM('pending','resolved_approved','resolved_rejected','escalated') | NOT NULL DEFAULT 'pending' |
| `reviewed_by`     | UUID                                                                | NULL                       | FK → User.id (moderator)                |
| `reviewed_at`     | TIMESTAMP                                                           | NULL                       |
| `resolution_note` | TEXT                                                                | NULL                       |
| `created_at`      | TIMESTAMP                                                           | DEFAULT NOW()              |

- When a post/comment is submitted and AI scans, an AI flag may be created immediately with status 'pending' if medium/high confidence. High confidence content is blocked and the flag is auto-resolved as 'resolved_rejected' with notification to author. That logic is enforced at application level.

#### 3.8.2 **ModerationAppeal**

_Appeals by content authors._

| Attribute            | Type                                |
| -------------------- | ----------------------------------- | ------------------------------------------ |
| `id`                 | UUID                                | PK                                         |
| `moderation_flag_id` | UUID                                | FK → ModerationFlag.id (the resolved flag) |
| `appealed_by`        | UUID                                | FK → User.id                               |
| `reason`             | TEXT                                |
| `status`             | ENUM('pending','approved','denied') |
| `reviewed_by`        | UUID                                | FK → User.id                               |
| `reviewed_at`        | TIMESTAMP                           |

#### 3.8.3 **UserRestriction**

_Temporary or permanent bans of users from posting._

| Attribute          | Type                                      |
| ------------------ | ----------------------------------------- | -------------------- |
| `id`               | UUID                                      | PK                   |
| `user_id`          | UUID                                      | FK → User.id, UNIQUE |
| `restriction_type` | ENUM('post_ban','comment_ban','full_ban') |
| `reason`           | TEXT                                      |
| `imposed_by`       | UUID                                      | FK → User.id         |
| `starts_at`        | TIMESTAMP                                 |
| `ends_at`          | TIMESTAMP                                 | NULL if permanent    |
| `active`           | BOOLEAN                                   |

---

### 3.9 Notifications & Messaging

#### 3.9.1 **Notification**

_In-app notifications._

| Attribute      | Type         | Constraints        |
| -------------- | ------------ | ------------------ | ---------------------------------------------------------- |
| `id`           | BIGSERIAL    | PK for high volume |
| `recipient_id` | UUID         | FK → User.id       |
| `type`         | VARCHAR(50)  | NOT NULL           | 'membership_request', 'event_reminder', 'flag_alert', etc. |
| `title`        | VARCHAR(200) |                    |
| `body`         | TEXT         |                    |
| `data`         | JSONB        | NULL               | Payload with links (e.g., club_id, event_id)               |
| `is_read`      | BOOLEAN      | DEFAULT FALSE      |
| `created_at`   | TIMESTAMP    | DEFAULT NOW()      |

- Partition by `recipient_id` hash or `created_at` for scalability.

#### 3.9.2 **EmailLog**

_Records emails sent (for auditing)._

| Attribute           | Type        |
| ------------------- | ----------- | ------------------------- |
| `id`                | BIGSERIAL   |
| `user_id`           | UUID        |
| `notification_type` | VARCHAR(50) |
| `sent_at`           | TIMESTAMP   |
| `status`            | VARCHAR(20) | 'sent','failed','bounced' |

---

### 3.10 Gamification

#### 3.10.1 **Achievement**

_Predefined badges._

| Attribute     | Type                  |
| ------------- | --------------------- | ------ | ----------------------- |
| `id`          | UUID                  | PK     |
| `code`        | VARCHAR(50)           | UNIQUE | 'event_enthusiast' etc. |
| `name`        | VARCHAR(100)          |
| `description` | TEXT                  |
| `icon_url`    | VARCHAR(500)          |
| `category`    | ENUM('member','club') |

#### 3.10.2 **UserAchievement**

_Awarded badges._

| Attribute          | Type      |
| ------------------ | --------- | ----------------------------------------------- |
| `id`               | UUID      | PK                                              |
| `user_id`          | UUID      | FK → User.id or Club.id (for club achievements) |
| `achievement_id`   | UUID      | FK → Achievement.id                             |
| `awarded_at`       | TIMESTAMP |
| `target_entity_id` | UUID      | Could reference club_id if club award.          |

#### 3.10.3 **ClubAchievement** (if separate)

Alternatively, `user_id` in UserAchievement can be NULL and `club_id` used.

---

### 3.11 Finance (Optional Module)

#### 3.11.1 **Budget**

_Club budget tracking._

| Attribute         | Type          |
| ----------------- | ------------- | -------------------- |
| `id`              | UUID          | PK                   |
| `club_id`         | UUID          | FK → Club.id, UNIQUE |
| `total_allocated` | DECIMAL(10,2) |
| `current_balance` | DECIMAL(10,2) | computed or cached   |

#### 3.11.2 **Transaction**

_Income/expense records._

| Attribute     | Type                                  |
| ------------- | ------------------------------------- | -------------------------------- |
| `id`          | UUID                                  | PK                               |
| `club_id`     | UUID                                  | FK → Club.id                     |
| `type`        | ENUM('income','expense')              |
| `amount`      | DECIMAL(10,2)                         |
| `category`    | VARCHAR(50)                           |
| `description` | TEXT                                  |
| `receipt_url` | VARCHAR(500)                          |
| `created_by`  | UUID                                  | FK → User.id                     |
| `status`      | ENUM('pending','approved','rejected') |
| `approved_by` | UUID                                  | FK → User.id (President/Faculty) |
| `created_at`  | TIMESTAMP                             |

---

### 3.12 Surveys & Feedback

#### 3.12.1 **Survey**

_Club or admin created form._

| Attribute         | Type                                             |
| ----------------- | ------------------------------------------------ | ------------------------------------------ |
| `id`              | UUID                                             | PK                                         |
| `club_id`         | UUID                                             | FK → Club.id (null for university surveys) |
| `title`           | VARCHAR(200)                                     |
| `target_audience` | ENUM('members','event_attendees','all_students') |
| `event_id`        | UUID                                             | NULL FK → Event.id                         |
| `status`          | ENUM('draft','published','closed')               |
| `created_by`      | UUID                                             |

#### 3.12.2 **SurveyQuestion**

| Attribute       | Type                                                 |
| --------------- | ---------------------------------------------------- | -------------- |
| `id`            | UUID                                                 | PK             |
| `survey_id`     | UUID                                                 | FK → Survey.id |
| `question_text` | TEXT                                                 |
| `question_type` | ENUM('text','single_choice','multi_choice','rating') |
| `options`       | JSONB                                                | NULL           |
| `required`      | BOOLEAN                                              |

#### 3.12.3 **SurveyResponse**

| Attribute      | Type      |
| -------------- | --------- | --- |
| `id`           | UUID      | PK  |
| `survey_id`    | UUID      | FK  |
| `user_id`      | UUID      | FK  |
| `submitted_at` | TIMESTAMP |

#### 3.12.4 **SurveyAnswer**

| Attribute           | Type   |
| ------------------- | ------ | ---------------------- |
| `response_id`       | UUID   | FK → SurveyResponse.id |
| `question_id`       | UUID   | FK → SurveyQuestion.id |
| `answer_text`       | TEXT   | NULL                   |
| `answer_option_ids` | UUID[] | For selections         |

---

### 3.13 Audit Logs & System

#### 3.13.1 **AuditLog**

_Immutable action log._

| Attribute       | Type        | Constraints                                              |
| --------------- | ----------- | -------------------------------------------------------- |
| `id`            | BIGSERIAL   | PK                                                       |
| `university_id` | UUID        | FK                                                       |
| `actor_id`      | UUID        | FK → User.id (could be system)                           |
| `target_type`   | VARCHAR(50) | e.g., 'Club', 'Event', 'User'                            |
| `target_id`     | UUID        |                                                          |
| `action`        | VARCHAR(50) | 'role_changed', 'membership_approved', 'content_flagged' |
| `old_value`     | JSONB       | NULL                                                     |
| `new_value`     | JSONB       | NULL                                                     |
| `ip_address`    | INET        | NOT NULL                                                 |
| `timestamp`     | TIMESTAMP   | DEFAULT NOW()                                            |

- Partition by month.

#### 3.13.2 **FeatureFlag** (System config)

| Attribute       | Type         |
| --------------- | ------------ | --- |
| `university_id` | UUID         | FK  |
| `flag_name`     | VARCHAR(100) |
| `enabled`       | BOOLEAN      |
| `value`         | JSONB        |

---

## 4. Key Relationships & Referential Integrity

- **User → University:** Many-to-One (cascading soft-delete not allowed).
- **Club → University:** Many-to-One.
- **ClubMembership → User, Club:** Many-to-One each, with unique composite.
- **ClubRoleDefinition → Club:** One club has many role definitions.
- **Post → Club, User:** with optional linked event/project.
- **Comment → polymorphic (Post, Project).**
- **Event → Club.**
- **EventRSVP → Event, User.**
- **AttendanceRecord → Event, User, possible EventRSVP.**
- **ModerationFlag → polymorphic content; references user reporter/moderator.**
- **Notification → User.**
- **Transaction → Club, User.**

All foreign keys are indexed. Cascading deletes are avoided for critical data; instead, soft deletes and archive strategies are preferred.

---

## 5. Indexing Strategy (Performance Requirements)

- Composite indexes on tenant-filtered queries: `(university_id, column)` pattern for User, Club, Event, Post, etc.
- Index on `(club_id, created_at)` for posts timelines.
- Index on `(event_id, user_id)` for RSVP.
- Index on `(user_id, status)` on ClubMembership.
- Index on `(commentable_type, commentable_id)` for comments.
- Search full-text: GIN index on `content` for Post/Comment, and on `tags` and `name` for Club.
- Notification table: index on `(recipient_id, is_read, created_at)`.

---

## 6. Data Retention & Archival

- Inactive clubs and their related content (events, posts) can be marked `archived_at` and moved to cold storage after configurable period (e.g., 3 years).
- Audit logs retained for 2 years minimum; automatic partitioning and purging.
- User account deletion triggers anonymization of personal fields and removal from rosters; their content may be retained anonymized.

---

## 7. Security and Privacy Considerations (Logical Level)

- **Row-level security** enforced via `university_id` context (application or DB-level policy).
- **Column-level encryption** (application) for PII fields like email, student_id; database may see encrypted values.
- **Audit trails** on all sensitive tables must include who did what.
- Passwords are stored only as hashes; local authentication is the default for the current phase.

---

This logical data model fully supports all UniClubs functional requirements, ensuring scalability, multi-tenancy, and future extensibility. The schema can be implemented on PostgreSQL or a similar relational database, with some JSONB columns for flexibility where schema evolution is expected.
