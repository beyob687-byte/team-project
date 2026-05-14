# UniClubs – Comprehensive Functional Requirements Specification

**Version:** 1.0  
**Date:** 2026-05-13  
**Platform:** Web Application (responsive, mobile-first) with optional Progressive Web App (PWA) support  
**Goal:** Provide a unified digital ecosystem for university clubs, students, and university administration to streamline club operations, foster engagement, ensure compliance, and leverage artificial intelligence for intelligent moderation and personalization.

---

## 1. Introduction

UniClubs is a centralized platform that connects university students with clubs and organizations. It empowers clubs to manage memberships, events, projects, and communications while giving students personalized discovery tools and giving university administrators oversight capabilities and analytics. AI-driven features automate moderation of harmful content, recommend clubs to students, and generate actionable activity summaries.

This document defines the **functional requirements** – the complete set of capabilities, workflows, and behaviors the system must support.

---

## 2. User Roles and Permissions

The system shall support a hierarchical role model with granular permissions. A single user may hold multiple roles across different clubs.

### 2.1 Student

Any authenticated user associated with the university (verified via email or student ID number plus password). A student can:

- Browse and discover clubs
- Request membership in clubs
- Participate in public events
- Receive personalized AI recommendations
- View their own membership dashboard

### 2.2 Club Member

A student who has been accepted into at least one club. Inherits all Student permissions, plus:

- Access to member-only content of their club(s)
- Ability to RSVP to member-only events
- View club internal communications and rosters

### 2.3 Club Officer Roles

Within a club, members can be assigned specific officer roles. Each role carries a predefined permission set that can be fine-tuned by the club President. Standard roles:

| Role                      | Typical Permissions                                                                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **President**             | Full administrative control: edit profile, manage all members and roles, create/edit/delete events, access analytics, approve/remove posts, manage finances (if module active), assign all other roles |
| **Vice President**        | Similar to President, with restrictions on deleting the club or changing the President’s role; can moderate content                                                                                    |
| **Secretary**             | Manage member roster, assign non-officer roles, record meeting minutes, send official communications, manage attendance reports                                                                        |
| **Treasurer**             | Manage club budget, track expenses, approve spending requests, view financial reports (if finance module enabled)                                                                                      |
| **Event Coordinator**     | Create, edit, and manage events and RSVP forms; manage event attendance and check-in                                                                                                                   |
| **Public Relations (PR)** | Create and manage public club posts, showcase projects, respond to public inquiries, manage external links                                                                                             |
| **Content Moderator**     | Review flagged posts, manage community guidelines enforcement, interact with AI moderation queue                                                                                                       |
| **Custom Roles**          | Preset templates allowed; President can define custom role names and assign a subset of permissions from a permission matrix                                                                           |

**Permission Matrix Items (sample):**

- Manage club profile details
- Manage membership (approve, remove, assign roles)
- Create and edit events
- Delete events
- View club analytics
- Export member data
- Manage club finances
- Post public updates
- Delete any post
- Moderate flagged content
- Approve project submissions
- Send bulk emails/notifications
- Manage RSVP forms

### 2.4 University Administrator

A staff/faculty account with elevated privileges across all clubs. Multiple tiers possible:

- **Club Affairs Officer:** View all clubs, their activity reports, membership statistics, event logs, flagged content overview. Cannot alter club data.
- **Compliance & Safety Officer:** Full access to AI moderation logs, flagged content, member reports, audit trails. May suspend clubs or members in case of violations.
- **Super Admin (IT):** System configuration, integration settings, data retention policies, feature flags.

University Admin actions may trigger automated notifications to club Presidents.

---

## 3. Core Modules & Functional Requirements

### 3.1 Club Registration & Profile Management

#### 3.1.1 Club Registration

- The system shall allow a University Admin to create or review a club registration request through the admin workflow.
- The request form shall capture:
  - Club full name, short name/abbreviation
  - Category (Academic, Cultural, Sports, Technology, Social Service, Arts, etc.; multi-select with primary)
  - Mission statement (text, up to 2000 characters)
  - Constitution/bylaws upload (PDF/DOC, max 10MB)
  - Proposed President’s university email (automatically verified)
  - Minimum 3 founding members’ university IDs/emails; system validates they are active students
  - Faculty advisor name, email, department (optional but encouraged)
  - Club logo (image, crop to square/circle, max 5MB)
  - Cover photo (optional, 16:9 ratio)
  - Tags/keywords for discovery (at least 3)
- The registration request enters a **university approval workflow**:
  - University Admin receives notification and can review details.
  - Admin can request additional information (comments attached to request).
  - Admin can approve, reject with reason, or conditionally approve (with required changes).
- Upon approval:
  - Club status becomes “Active”.
  - The President and founding members are automatically assigned their roles.
  - A club homepage is generated.
  - Welcome email and in-app notification sent to founders.

#### 3.1.2 Club Profile Management

- Club officers with “Manage club profile” permission can update:
  - Description, mission, category, tags
  - Contact email (auto forwards to officer list), social media links (Instagram, LinkedIn, Discord, etc.), website URL
  - Logo, cover photo, media gallery (images/videos showcasing activities, max 20 items)
  - Membership policy: Open (auto-approve) / Approval Required / Invite-Only
  - Recruitment status: Actively Recruiting / Not Recruiting
  - Meeting schedule template (day, time, location, frequency) displayed on profile
- Change history for critical fields (name, category, policy) is logged and visible to University Admin.
- The public profile page shall show: club name, logo, description, upcoming events (if public), project highlights, member count (public/not), social links, and a “Request to Join” button.

---

### 3.2 Membership Management

#### 3.2.1 Joining a Club

- Students can discover clubs through search/browse and click “Request to Join”.
- If policy is **Open**: membership is instantly granted; user becomes Member.
- If **Approval Required**: a request is sent to club officers with “Manage membership” permission. They receive notification and can approve/deny from dashboard. Denial can include an optional message (only visible to the student).
- If **Invite-Only**: students cannot request directly; officers must send invitations.

#### 3.2.2 Membership Roster

- Club officers can view the full roster table with columns:
  - Name, university ID, email, join date, current role, membership status (Active, Suspended, Alumni)
  - Attendance percentage (last N events), activity score (optional gamification)
- Search, filter (by role, status, join date range), sort.
- Bulk actions: assign role, send message, export to CSV/Excel (only for officers with export permission).
- Individual profile view shows student’s basic info (as per privacy settings), their joined clubs, and within this club: events attended, RSVP history, notes.

#### 3.2.3 Role Assignment and Management

- President or authorized officers can assign/change role for any member.
- Assignment triggers notification to the member and logs action in club audit log.
- Custom role creation: role name, select permissions from a checklist (grouped by module).
- System prevents removal of the last President; role transfer must be initiated and accepted by another officer.
- Members can voluntarily leave a club; leaving triggers removal from the roster and log.

#### 3.2.4 Member-Only Communication

- Club officers can send targeted messages:
  - To all members, to specific roles, to selected individuals.
  - Message appears as in-app notification and optionally via email (member can set preferences).
- Secretary can publish “Meeting Minutes” (rich text + attachments) viewable by members only.

---

### 3.3 Project & Portfolio Showcase

#### 3.3.1 Project Creation

- Club officers with appropriate permission can create projects.
- Each project entry contains:
  - Title, description (rich text), start/end dates
  - Cover image, gallery (images, videos, PDFs)
  - Collaborators (tag club members or external partners)
  - Status: Planning, In Progress, Completed
  - Outcome/results summary
  - Links to external repositories (GitHub, Behance) or publications
- Projects can be marked as **Public Showcase** (visible to all) or **Internal** (members only).

#### 3.3.2 Project Display

- Club public profile has a “Projects” tab showing timeline/grid of public projects.
- Each project has a detail page with full content, comments (if enabled), and share buttons.
- Students can “like” or “applaud” projects; clubs can see engagement metrics.

#### 3.3.3 AI Project Summarizer (Optional Feature)

- The system can generate an executive summary of project descriptions for use in reports and previews, using an on-demand AI model.

---

### 3.4 Event Management & RSVP

#### 3.4.1 Event Creation

- Authorized officers can create an event with:
  - Title, description (rich text, embed images/videos)
  - Type: In-person / Virtual / Hybrid
  - Location details (address, room number, or virtual meeting link)
  - Start and end date/time, timezone
  - Cover image
  - Capacity limit (optional, with waitlist enable/disable)
  - Visibility: Public (visible to all students) / Club Members Only / Invite-Only
  - RSVP settings:
    - RSVP Required (yes/no)
    - RSVP opens/closes date-time
    - RSVP form customization (add custom questions beyond default name/email: e.g., dietary restrictions, year of study, guest allowed? number of guests)
    - Maximum guests per registrant
  - Check-in method: manual, QR code, geolocation (optional)

#### 3.4.2 RSVP Form & Responses

- If RSVP required, the event page shows a “Register/RSVP” button.
- Students fill in the form; required fields: name, email (auto-filled from profile), response to custom questions.
- Upon submission:
  - If capacity reached and waitlist disabled: user sees “Event Full”.
  - If waitlist enabled: user gets waitlist position; if a spot opens (cancellation), next waitlisted student auto-promoted and notified.
  - Confirmation is displayed with a ticket/QR code for check-in. Confirmation email is sent.
- Users can cancel their RSVP; cancellation triggers waitlist promotion if applicable.

#### 3.4.3 Event Management Dashboard

- Club officers can view list of events, filter by upcoming/past/draft.
- For each event, view number of RSVPs, attendee list, waitlist count.
- Edit event details (changes trigger notification to all RSVPed students).
- Bulk message attendees.
- Duplicate event (copy details for recurring events).

#### 3.4.4 Event Public Display

- On club profile and main “Events” discovery page (for all clubs), public events appear with filters: date, category, club.
- Students can add events to their personal calendar (.ics download or direct add to Google/Apple/Outlook calendar via link).

#### 3.4.5 Post-Event Actions

- Officers can mark event as completed, then:
  - Upload event gallery, recordings, materials.
  - Publish a post-event summary.
  - Trigger automatic attendance processing (if check-in data exists).

---

### 3.5 Attendance Tracking & Check-In

#### 3.5.1 Check-In Methods

- **Manual Check-In:** Officer checks in attendees by searching roster or RSVP list and marking “Present”.
- **QR Code Check-In:**
  - Each registered attendee receives a unique QR code in their event ticket (web/app view).
  - At the event, an officer scans codes using their device camera (in-app scanner) or attendees scan a venue QR code displayed by the officer (two-way). Scanning records timestamp and marks attendance.
- **Geolocation Check-In (for virtual/hybrid):**
  - Option to verify attendance via proximity to a defined location (using device GPS) with configurable radius.
- **Self Check-In via Code:** Event coordinator generates a one-time check-in code/phrase shared at event start; attendees enter it on the event page within a time window to self-check-in.

#### 3.5.2 Attendance Reports

- For each event, the system generates an attendance list: registered, presented, absent (registered but not checked in), and walk-ins (added manually).
- Summary statistics: attendance rate = (present / registered) \* 100.
- Historical attendance per member is aggregated and visible on member profile and club reports (with privacy considerations: officers can view for their club; members can view their own).
- Export attendance list to CSV/PDF.

#### 3.5.3 Notifications

- Reminder notification (in-app and email) 24 hours and 1 hour before event start to registered attendees.

---

### 3.6 Communication, Posts, and Content Moderation

#### 3.6.1 Club Posts

- Officers with “Post public updates” permission can create posts on the club’s timeline.
- Post types:
  - **General Update:** Text, images, video, links.
  - **Event Promotion:** Embedded event card.
  - **Project Highlight:** Embedded project card.
  - **Poll:** Question with multiple choices, duration, results visibility (public/private).
- Posts can be scheduled for a future date/time.
- Public posts appear on the club page and cross-campus “Feed” (global/for-you feed based on interests). Members can like, comment, share internally (repost to their profile or to other groups).

#### 3.6.2 AI-Powered Bad/Slur Content Detection

- **Real-Time Moderation:** Every new post, comment, event description, or project text is scanned by the AI moderation engine before being publicly visible. New content remains hidden in an **under review** state until approved.
- The AI detects:
  - Hate speech, slurs, profanity, harassment, bullying.
  - Discriminatory language based on race, gender, religion, etc.
  - Spam/scam patterns.
  - Sharing of sensitive personal information (doxxing).
- Based on confidence score and configured rules:
  - **High confidence violation:** Content is immediately blocked and sent to quarantine. The author receives an automated explanation (with rule cited) and a link to appeal. Club officers and University Compliance Officer are notified.
  - **Medium confidence / ambiguous:** Content stays hidden in an **under review** state. Club Content Moderator receives notification to approve or reject within a defined timeframe. If rejected, the author is notified.
  - **Low confidence:** Content is approved and published, but logged for periodic audit.
- Club moderators can view a Moderation Queue with all flagged items, see AI rationale, and take action (approve/reject/block user from posting temporarily).
- University Admins have a global moderation dashboard to view all flagged content across clubs, with trend analysis of violations.

#### 3.6.3 User Reporting

- Any user can report a post, comment, or club profile for violating community guidelines.
- Reporting form: select reason category, optional description.
- Reports appear in the Club moderation queue (anonymized reporter) and university global queue.
- Club officers can resolve reports; if no action in 48 hours, escalation to University Admin.

#### 3.6.4 Moderation Appeals

- Users whose content was blocked can submit an appeal with justification.
- Appeals go to Club Content Moderator or University Admin (depending on severity). Decision is final and recorded.

---

### 3.7 Notifications System

#### 3.7.1 In-App Notifications

- Real-time notification bell with unread count.
- Notification categories:
  - Membership: request approved/denied, role change, invitation.
  - Events: RSVP confirmation, reminder, event update, waitlist promotion.
  - Club Posts: new post, poll, project highlight from clubs the student is member of (optional).
  - Moderation: flagged content alert, appeal decision.
  - System: registration approval, profile changes, university-wide announcements.
  - AI Recommendations: new club suggestions, trending clubs.
- Notification center with filters, mark as read, delete, archive.

#### 3.7.2 Email Notifications

- All critical notifications are also sent via email based on user preferences.
- Users can customize email notification frequency:
  - Real-time (instant)
  - Daily digest
  - Weekly digest
  - Off
- Granular toggles per category (membership, events, posts, recommendations, system).

#### 3.7.3 Push Notifications (PWA/Mobile)

- If accessed as PWA, browser-based push notifications for key alerts.

#### 3.7.4 Club Admin Notifications

- Club officers receive summarized notifications: new member requests, events needing action, moderation queue count, upcoming event attendance summary.

---

### 3.8 Student Dashboard & Discovery

#### 3.8.1 Personalized Dashboard

- After login, student sees:
  - “My Clubs” cards (logo, name, next upcoming event or meeting).
  - “My Upcoming Events” list aggregated from all clubs they joined + public events they RSVPed.
  - “Pending Requests” membership status.
  - “For You” personalized feed of club posts, announcements, and recommended clubs.
  - Quick actions: browse clubs, explore events, view attendance history.

#### 3.8.2 Club Discovery & Search

- Directory page with search bar (club name, description, tags).
- Filter by: category, recruitment status, membership size, activity level (active events/projects), presence of faculty advisor.
- Sort by: relevance, newest, most members, most events, AI recommendation score.
- Each club card shows logo, name, short mission, tags, next public event date, recruitment badge.
- “Compare Clubs” option: select up to 3 clubs and view side-by-side comparison of stats, upcoming events, public projects.

#### 3.8.3 AI-Powered Club Recommendations

- The system employs a recommendation engine using:
  - Student’s declared interests (captured during onboarding or manually editable in profile: academic major, hobbies, skills, career goals)
  - Past club memberships and event attendance
  - Browsing/search behavior on the platform
  - Similarity to other students (collaborative filtering)
- Recommendation sections:
  - “Because you’re interested in [Category]” – clubs in that category.
  - “Students like you also joined” – clubs frequented by similar profiles.
  - “Trending & Popular” – clubs with recent activity spikes.
  - “Newly Launched” – recently approved clubs.
- AI-generated personalized digest email (if opted in) with top 3 club suggestions and reasoning (“Because you attended 3 tech talks...”).

#### 3.8.4 Club Info & Membership Action

- On a club’s public page, student can:
  - View full details, events, public projects, leadership roster (officers’ names/roles, optionally anonymized contact).
  - “Request to Join” / “Membership Pending” status.
  - Direct message the club’s contact email.
  - “Share Club” via link or social media.

---

### 3.9 University Administration & Monitoring

#### 3.9.1 Global Dashboard

- University Admin homepage:
  - Counts: total active clubs, total memberships, events this month, flagged content pending.
  - Recent registration requests needing approval.
  - Alerts: clubs with zero activity in last 30 days, spikes in flagged content, overdue reports.

#### 3.9.2 Club Oversight

- Browse/search all clubs; view detailed club profiles including private fields (officer contacts, member list).
- Ability to **suspend** a club (temporary deactivation, hide from public, freeze all operations) with mandatory reason; notification sent to President.
- Ability to **revoke** club registration, moving to inactive archive.
- View club activity log: officer changes, event creations, membership flow.
- Access clubs’ internal analytics without requiring officer permission.

#### 3.9.3 Automated Analytical Reports

- University Admin can generate on-demand or schedule regular (weekly/monthly/semesterly) reports:
  - **Club Health Report:** Membership growth/decline, event frequency, average event attendance, project outputs, budget utilization (if finance enabled).
  - **Engagement Report:** Active members vs. total members % per club, cross-club participation, RSVP conversion rates.
  - **Diversity & Inclusion Report:** Demographic distribution of clubs (if optional voluntary demographic data collected, with anonymization).
  - **Moderation & Compliance Report:** Number of flagged posts, categories of violations, resolution times, repeat offenders.
- Reports exportable to PDF, Excel, and can be emailed to predefined recipients.
- AI-generated executive summaries highlighting key trends, anomalies, and recommendations (e.g., “Club X has a 40% drop in member activity; suggest advisor check-in”).

#### 3.9.4 Compliance Workflows

- If a club or member accumulates a threshold of violations, system automatically recommends sanctions (e.g., warning, probation, suspension) to Admin.
- Admin can issue formal warnings with attached policy references; recorded in entity’s history.
- Ability to conduct surveys/polls targeting all club leaders regarding policies, feedback.

---

### 3.10 Analytics & Reporting for Clubs

#### 3.10.1 Club-Level Dashboard

- Club officers with analytics permission access a dashboard showing:
  - Member statistics: total, new this month, attrition rate.
  - Event metrics: events hosted, total registrations, average attendance rate, peak check-in time.
  - Engagement: post likes/comments, project views, RSVP form submissions.
  - Demographic breakdown of members (if members opt-in to share). Visualized as charts (pie, bar, line).
- Date range selection.

#### 3.10.2 AI-Generated Activity Reports

- Monthly/quarterly, the system can auto-generate a **Club Activity Report**.
- The AI compiles:
  - Summary of events held, participation highlights.
  - Project milestones achieved.
  - Membership changes and notable achievements.
  - Comparison with previous period (if data exists).
  - Suggested areas of improvement (e.g., “Attendance dropped in last two events – consider polling members for better timing”).
- Draft report presented to President for review; can be edited, then published to members or shared with University Admin.

#### 3.10.3 Export and Data Access

- Export raw data for membership, events, attendance in CSV/Excel.
- Integration with external tools (Google Sheets, Power BI) via API (optional).

---

### 3.11 Additional Feature: Financial Management (Club Budget & Expenses)

#### 3.11.1 Budget Tracking

- If enabled for a club, Treasurer can set an overall budget (allocated by university or raised funds).
- Record income sources: university grant, sponsorship, member dues (with tracking), fundraising.
- Record expenses: item, amount, date, category (venue, food, equipment, travel), receipt image upload.
- Real-time balance view.
- Approvals: large expenses (>configurable threshold) require President or faculty advisor approval via in-system workflow.

#### 3.11.2 Financial Reports

- Generate income/expense statements, pie charts by category.
- Export for accounting; audit trail of all changes.

---

### 3.12 Additional Feature: Sponsorship & Partnerships

- Clubs can list sponsorship opportunities on their profile with a “Sponsor Us” page detailing benefits.
- External sponsors can submit inquiries via form; club PR officer receives and manages.
- Track sponsor contributions as income in finance.
- University can vet sponsor requests to avoid conflicts.

---

### 3.13 Additional Feature: Document Repository & Resource Sharing

- Each club has a private document library (for officers/members depending on permissions).
- Upload files (minutes, templates, guides); versioning support.
- Shared resource folder accessible to all members for club materials.
- University Admin can push official documents to all clubs (policy updates, forms).

---

### 3.14 Additional Feature: Polls, Surveys, and Feedback

- Officers can create polls (quick multiple-choice, visible in post).
- Detailed surveys: form builder with multiple question types (text, single/multi-choice, rating scale), branching logic.
- Target audience: members, event attendees, all students.
- Results dashboard with charts and export.
- AI can analyze open-ended survey responses to extract themes and sentiment.

---

### 3.15 Additional Feature: Gamification and Engagement

- **Achievement Badges** for clubs and members:
  - Examples for members: “Event Enthusiast” (attend 10 events), “Early Bird” (RSVP to 5 events within first hour), “Connector” (joined 3+ clubs), “Feedback Guru” (completed 5 surveys).
  - For clubs: “Rising Star” (50% membership growth), “Community Builder” (hosted 20 events), “Engagement Champion” (90% attendance rate).
- Badges displayed on profiles, club pages.
- Leaderboards (opt-in) for most active clubs per category, semesterly.

---

### 3.16 Additional Feature: Alumni and Transition Management

- When members graduate, they can be transitioned to **Alumni** role (if club allows) with limited access (can view posts, networking, but not hold officer roles).
- Officer transition workflow: upcoming President election/selection recorded; passing the baton transfers all permissions after new President accepts.
- Archive past officers as “Past Leadership” public list.

---

### 3.17 Additional Feature: Integration & Interoperability

#### 3.17.1 Local Authentication (Phase 1)

- Users sign up and log in with email or student ID number plus password for the current release.
- Passwords are stored as hashes only, and user records can later be mapped to a university SSO profile if that integration is added.
- Automatically sync basic profile fields entered at signup: name, email, student ID, department/major, enrollment status.

#### 3.17.2 Calendar Sync

- All events can be added to external calendars via .ics download or direct CalDAV links.
- Option for clubs to sync their public event calendar to university main calendar.

#### 3.17.3 LMS Integration (Optional)

- For academic clubs, link to course materials or discussion boards from university LMS (Canvas, Moodle).

#### 3.17.4 Communication Tools

- Embed club chat (e.g., Discord widget, Slack) on club page; officers can input invite link.

---

### 3.18 Accessibility & User Experience

- The platform must comply with WCAG 2.1 AA standards.
- Keyboard navigation, screen reader compatibility, color contrast modes.
- Multilingual support (configurable per university). Content may be translated by AI on-the-fly for common phrases.

---

### 3.19 Privacy and Data Controls

- Students can manage privacy:
  - Profile visibility: show/hide email, phone, club membership list to non-members.
  - Control whether they appear in public club rosters (officers always visible).
  - Opt out of data usage for AI recommendations (recommendations revert to non-personalized).
- Compliance with GDPR/CCPA as configured by university.

---

### 3.20 Audit Trails & Logging

- Every administrative action (role change, membership status, content moderation decision, financial transaction) is logged with:
  - Timestamp, actor, action, target, previous and new values.
- Logs viewable by University Admin and by respective club President for their own club.
- Immutable log; cannot be edited or deleted by non-system administrators.

---

## 4. AI Features – Detailed Requirements

### 4.1 Content Moderation AI

- Model must be trained on a diverse dataset including academic and colloquial language.
- Support for multiple languages with slur detection.
- Real-time inference; response within 2 seconds.
- Continuous learning: moderators can flag false positives/negatives, feeding back to improve model (human-in-the-loop).
- Quarterly report from AI on platform health (volume of violations, new trends).

### 4.2 AI Club Recommendation Engine

- Input: student profile, explicit preferences, implicit behavior (clicks, joins, event attendance), current semester.
- Output: ranked list of clubs with a relevance score and a short personalized explanation snippet (e.g., “Recommended because you’re a CS major and active in hackathons”).
- Cold start problem: new students prompted to select interests and activities; recommendations generated from those.
- Refresh daily; in-app widget and email digest.

### 4.3 AI Activity Summarizer & Report Generation

- For club officers: summarize past month’s activity (events, members, posts) into a coherent narrative for the activity report. Provide actionable insights.
- For university admin: generate comparative narrative across clubs, flagging anomalies (“Club A’s engagement dropped sharply after leadership change”).
- Uses natural language generation (NLG). Editable before publishing.

### 4.4 AI-Powered Poll/Survey Sentiment Analysis

- Analyze free-text responses in surveys to extract key themes, sentiment (positive/negative/neutral), and trending topics, presented as a word cloud and summary.

---

## 5. System Notifications & Alerts – Complete Matrix

| Trigger Event                       | Recipient(s)                    | Channel(s)                           | Configurable?    |
| ----------------------------------- | ------------------------------- | ------------------------------------ | ---------------- |
| New membership request              | Club officers (manage members)  | In-app, email                        | Yes (club pref)  |
| Membership request approved/denied  | Student                         | In-app, email                        | User pref        |
| Role assigned/changed               | Affected member                 | In-app, email                        | User pref        |
| New event created – public          | All students (if opted in)      | In-app notification on discover feed | User pref        |
| New event – members/club            | Club members                    | In-app, email                        | User pref        |
| Event reminder (24h, 1h)            | Registered attendees            | In-app, email, push                  | User pref        |
| RSVP confirmation                   | Attendee                        | In-app, email                        | No               |
| Waitlist promotion                  | Promoted student                | In-app, email                        | Yes              |
| Post flagged for moderation         | Club moderators, content author | In-app, email                        | Club mod can set |
| Moderation action taken             | Author                          | In-app, email                        | No               |
| Club registration approved/rejected | Club founders                   | In-app, email                        | No               |
| Club suspended or reactivated       | Club President, all members     | In-app, email                        | No               |
| AI recommendation digest            | Students (opted in)             | Email, in-app widget                 | Yes              |
| University-wide announcement        | All users or targeted           | In-app, email                        | Admin controlled |
| Survey/poll published               | Targeted audience               | In-app, email (if important)         | Creator choice   |
| Financial approval request          | President/Treasurer             | In-app, email                        | Yes              |
| Monthly club activity report ready  | Club officers (analytics)       | In-app, email                        | Yes              |
| Automated compliance warning        | Club President, relevant Admin  | In-app, email                        | No               |

---

## 6. Reporting & Data Export Requirements

### 6.1 Club-Generated Reports

- Membership report (active, new, alumni, attrition).
- Event summary report (per event or aggregated with attendance, feedback).
- Financial statement report.
- Moderation log report.
- Export formats: PDF, CSV, Excel.

### 6.2 University-Generated Reports

- Cross-club comparative analytics.
- Student engagement heatmap (which departments most involved).
- Diversity & Inclusion dashboard.
- Compliance incident report.
- Budget utilization overview.
- Export with scheduled email distribution.

---

## 7. Technical Constraints & Assumptions

- User authentication via email or student ID number plus password for the initial release; university SSO can be added later.
- File storage limits: 5MB for profile images, 100MB for document uploads, 200MB video per event.
- The platform will be web-based (React/Vue frontend, scalable backend). Mobile experience must be fully responsive; PWA optional.
- Real-time features (notification) via WebSocket.
- AI services may be hosted on-cloud with scalability.
- System must handle up to 50,000 concurrent users across multiple universities (multi-tenant architecture with data isolation).

---

**Document History**  
First draft – For review by stakeholders.

This functional requirements document is intended to be exhaustive, yet may evolve during design and development phases. All modules described are subject to detailed UX wireframes and technical architecture specifications.
