# UniClubs

> **University Club Management Platform** - A comprehensive digital ecosystem for university clubs, students, and administration to streamline operations, foster engagement, and leverage AI for intelligent moderation and personalization.

![UniClubs Screenshot](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=UniClubs+Platform+Preview)

## Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

UniClubs is a centralized platform that connects university students with clubs and organizations. It empowers clubs to manage memberships, events, projects, and communications while giving students personalized discovery tools and giving university administrators oversight capabilities and analytics. AI-driven features automate moderation of harmful content, recommend clubs to students, and generate actionable activity summaries.

The platform addresses the common challenges faced by university club ecosystems:
- Fragmented communication channels
- Manual administrative processes
- Limited discovery mechanisms for students
- Inconsistent compliance oversight
- Lack of engagement analytics

## Key Features

### 👥 User Roles & Permissions
- **Student**: Browse clubs, request membership, participate in events, receive AI recommendations
- **Club Member**: Access member-only content, RSVP to events, view club communications
- **Club Officers** (President, VP, Secretary, Treasurer, Event Coordinator, PR Officer, Content Moderator): Role-specific permissions for managing club operations
- **University Administrators** (Club Affairs Officer, Compliance & Safety Officer, Super Admin): Oversight capabilities across all clubs

### 🏢 Club Management
- **Club Registration & Approval Workflow**: University-administered approval process for new clubs
- **Profile Management**: Customizable club profiles with logos, cover photos, social links, and media galleries
- **Membership Policies**: Open, Approval Required, or Invite-Only membership options
- **Role Management**: Flexible role assignment with customizable permissions
- **Club Analytics**: Activity reports, membership statistics, and engagement metrics

### 📅 Events & Activities
- **Event Creation & Management**: Full-featured event scheduling with location, time, capacity settings
- **RSVP System**: Attendance tracking, waitlist management, and check-in capabilities (manual, QR code, geolocation)
- **Event Types**: Public, member-only, and ticketed events
- **Recurring Events**: Support for regular meetings and activities

### 💬 Communication & Content
- **Club Posts**: Announcements, updates, and multimedia content sharing
- **Polls & Surveys**: Interactive voting and feedback mechanisms
- **Comments & Reactions**: Community engagement through discussions
- **AI Content Moderation**: Real-time scanning for policy violations with human review workflow
- **Project Showcase**: Portfolio management for club initiatives and achievements

### 🤖 AI-Powered Features
- **Intelligent Moderation**: Automated scanning of posts/comments for harmful content
- **Personalized Recommendations**: AI-driven club suggestions based on student interests and activity
- **Activity Reports**: Generated summaries of club activities and achievements
- **Trend Analysis**: Identification of popular topics and emerging interests

### 📊 Administration & Oversight
- **University Admin Dashboard**: Comprehensive view of all club activities
- **Compliance Tools**: Flagged content review, member reporting, and disciplinary actions
- **Data Export**: CSV/Excel exports for rosters, attendance, and analytics
- **Audit Trails**: Complete history of club changes and administrative actions
- **Notification System**: Automated alerts for important events and actions

### ⚙️ Technical Features
- **Responsive Design**: Mobile-first approach with PWA support
- **Real-time Updates**: Socket.IO powered live notifications
- **File Uploads**: Cloudinary integration for images and media
- **Rate Limiting**: Protection against abuse on authentication endpoints
- **Security**: JWT authentication, bcrypt password hashing, helmet.js, CORS policies
- **Internationalization**: Ready for multi-language support
- **Accessibility**: WCAG 2.1 compliant interface components

## Architecture

### High-Level Structure
```
UniClubs/
├── frontend/              # React/Vite SPA
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Role-based pages (student, officer, admin)
│   │   ├── services/      # API service layer
│   │   ├── store/         # Zustand state management
│   │   ├── utils/         # Helper functions and constants
│   │   └── App.jsx        # Main application component
├── backend/               # Node.js/Express API
│   └── src/
│       ├── config/        # Environment configuration
│       ├── db/            # Database connection, migrations, seeds
│       ├── middleware/    # Auth, admin, error handling, rate limiting
│       ├── modules/       # Feature-based modules (auth, clubs, users, etc.)
│       ├── websocket/     # Socket.IO server implementation
│       └── index.js       # Application entry point
├── documentation/         # API specs, requirements, design docs
└── scripts/               # Deployment and utility scripts
```

### Data Flow
1. **Client → API Gateway**: Requests routed through Express middleware stack
2. **Authentication**: JWT verification and role-based access control
3. **Service Layer**: Business logic encapsulated in service modules
4. **Database**: PostgreSQL accessed via Knex.js query builder
5. **Real-time**: Socket.IO events for live updates (notifications, chat)
6. **AI Services**: External APIs for content moderation and recommendations

### Security Model
- **Authentication**: Stateless JWT tokens with refresh token rotation
- **Authorization**: Role-based access control (RBAC) with resource-level permissions
- **Data Protection**: Parameterized queries to prevent SQL injection
- **Input Validation**: Zod schema validation for all API inputs
- **CSRF Protection**: Same-site cookies and token validation where applicable
- **Rate Limiting**: IP-based and user-based limits on sensitive endpoints

## Technology Stack

### Frontend
- **Framework**: React 18 with Vite bundler
- **State Management**: Zustand
- **Routing**: React Router v6 with code splitting and lazy loading
- **Styling**: Tailwind CSS 3 with custom design system
- **UI Components**: Custom components with Lucide icons
- **Data Fetching**: Axios with interceptors for auth and error handling
- **Charts**: Recharts for data visualization
- **Form Handling**: Custom validation with Yup/Zod schemas
- **PWA**: Vite PWA plugin for offline capabilities
- **Testing**: Vitest with React Testing Library

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4
- **Database**: PostgreSQL with Knex.js query builder
- **ORM**: Knex.js for migrations and query building
- **Authentication**: JWT (jsonwebtoken) with bcryptjs password hashing
- **Real-time**: Socket.IO 4 for WebSocket connections
- **File Storage**: Cloudinary integration for image/media uploads
- **Validation**: Zod for request/response validation
- **Security**: Helmet.js, CORS, compression, rate limiting
- **Logging**: Winston with multiple transports
- **Testing**: Jest with Supertest for API tests
- **Background Jobs**: BullMQ for queued processing (AI moderation, emails)
- **Documentation**: JSDoc with automated API documentation generation

### DevOps & Infrastructure
- **Containerization**: Docker multi-stage builds
- **Orchestration**: Docker Compose for local development
- **CI/CD**: GitHub Actions workflows (testing, linting, building)
- **Monitoring**: Health check endpoints and performance metrics
- **Environment**: Dotenv for environment-specific configuration
- **Code Quality**: ESLint, Prettier, and TypeScript strict mode
- **Security Scanning**: npm audit and dependency vulnerability checks

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- npm >= 9.0.0
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-organization/uniclubs.git
   cd uniclubs
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   # Copy example files and modify as needed
   cp .env.example .env
   cp backend/.env.example backend/.env
   ```

4. **Initialize the database**
   ```bash
   # Run database migrations
   cd backend
   npx knex migrate:latest
   
   # Run seed data (optional, for development)
   npx knex seed:run
   cd ..
   ```

5. **Start the development servers**
   ```bash
   # Start backend server
   cd backend
   npm run dev
   # In another terminal:
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:5173`
   The backend API will be available at `http://localhost:3000`

### Development Scripts

#### Frontend (`package.json`)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run Vitest tests
npm run test:ui      # Run tests with UI
```

#### Backend (`backend/package.json`)
```bash
npm run dev          # Start development server with nodemon
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
```

## API Documentation

The UniClubs API follows RESTful principles with versioning (`/api/v1/`). All responses are wrapped in a consistent format:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

### Authentication
All protected routes require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

### Key Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Authenticate user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Invalidate refresh token

#### Clubs
- `GET /api/v1/clubs` - List clubs (public)
- `GET /api/v1/clubs/:id` - Get club details (public)
- `POST /api/v1/clubs/register` - Submit club registration request
- `GET /api/v1/clubs/:id/my-membership` - Get user's membership in club
- `POST /api/v1/clubs/:id/join` - Request to join club
- `PATCH /api/v1/clubs/:id` - Update club (officer only)
- `GET /api/v1/clubs/:id/members` - Get club membership roster (officer only)

#### Events
- `GET /api/v1/events` - List events
- `GET /api/v1/events/:id` - Get event details
- `POST /api/v1/events` - Create event (officer only)
- `PATCH /api/v1/events/:id` - Update event (officer only)
- `DELETE /api/v1/events/:id` - Delete event (officer only)
- `POST /api/v1/events/:id/rsvp` - RSVP to event
- `DELETE /api/v1/events/:id/rsvp` - Cancel RSVP

#### Posts
- `GET /api/v1/posts` - List posts
- `GET /api/v1/posts/:id` - Get post details
- `POST /api/v1/posts` - Create post (officer/PR officer)
- `PATCH /api/v1/posts/:id` - Update post (officer/PR officer)
- `DELETE /api/v1/posts/:id` - Delete post (officer)
- `POST /api/v1/posts/:id/comment` - Comment on post
- `POST /api/v1/posts/:id/report` - Report post/comment

### Real-time Events (Socket.IO)
The server emits events on connection (`io`):

- `notification:new` - New notification for user
- `club:update` - Club data updated
- `event:update` - Event data updated
- `post:new` - New post in club
- `message:new` - New direct message

Clients can emit:
- `join:club:{clubId}` - Join club room for updates
- `leave:club:{clubId}` - Leave club room
- `typing:post:{postId}` - Typing indicator for comments

## Environment Variables

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_WS_URL=http://localhost:3000
VITE_PWA_ENABLED=true
VITE_APP_NAME=UniClubs
```

### Backend (`.env`)
```env
# Server Configuration
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=uniclubs
DB_USER=postgres
DB_PASSWORD=postgres

# Authentication
JWT_SECRET=your_jwt_secret_here_change_in_production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_here_change_in_production
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email (for notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
EMAIL_FROM=noreply@uniclubs.edu

# AI Services (optional)
AI_MODERATION_ENDPOINT=https://api.example.com/moderate
AI_RECOMMENDATION_ENDPOINT=https://api.example.com/recommend
AI_REPORT_ENDPOINT=https://api.example.com/generate-report
```

## Database Schema

### Core Tables

#### `users`
- `id` (UUID, PK)
- `email` (String, Unique)
- `password_hash` (String)
- `first_name` (String)
- `last_name` (String)
- `user_type` (Enum: student, faculty, staff)
- `university_id` (String, Unique)
- `email_verified` (Boolean)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### `clubs`
- `id` (UUID, PK)
- `name` (String)
- `short_name` (String)
- `description` (Text)
- `mission_statement` (Text)
- `logo_url` (String)
- `cover_photo_url` (String)
- `status` (Enum: pending, active, suspended, inactive)
- `membership_policy` (Enum: open, approval_required, invite_only)
- `recruitment_status` (Enum: actively_recruiting, not_recruiting)
- `category` (String array)
- `tags` (String array)
- `meeting_schedule` (JSON)
- `created_by` (UUID, FK → users.id)
- `approved_by` (UUID, FK → users.id, Nullable)
- `approved_at` (Timestamp, Nullable)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### `memberships`
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `club_id` (UUID, FK → clubs.id)
- `role` (String: member, president, vp, secretary, treasurer, etc.)
- `status` (Enum: active, pending, suspended, alumni)
- `joined_at` (Timestamp)
- `left_at` (Timestamp, Nullable)
- `created_at` (Timestamp)

#### `events`
- `id` (UUID, PK)
- `club_id` (UUID, FK → clubs.id)
- `title` (String)
- `description` (Text)
- `start_time` (Timestamp)
- `end_time` (Timestamp)
- `location` (String)
- `capacity` (Integer, Nullable)
- `is_public` (Boolean)
- `created_by` (UUID, FK → users.id)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### `posts`
- `id` (UUID, PK)
- `club_id` (UUID, FK → clubs.id)
- `author_id` (UUID, FK → users.id)
- `content` (Text)
- `media_urls` (String array)
- `is_poll` (Boolean)
- `poll_options` (JSON, Nullable)
- `status` (Enum: draft, published, under_review, rejected)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### `notifications`
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `type` (String: membership_approved, event_invitation, post_comment, etc.)
- `title` (String)
- `message` (String)
- `related_id` (UUID, Nullable)  # References clubs, events, posts, etc.
- `related_type` (String, Nullable)
- `is_read` (Boolean)
- `created_at` (Timestamp)

### Relationships
- Users can have multiple memberships (many-to-many through memberships table)
- Clubs have one creator (user) and can have many members
- Events belong to one club
- Posts belong to one club and have one author
- Notifications belong to one user

## Testing

### Backend Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suite
npm test -- --testNamePattern="Clubs"
```

### Frontend Tests
```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Structure
- **Unit Tests**: Individual functions and components
- **Integration Tests**: API endpoints and service interactions
- **E2E Tests**: Critical user journeys (using Cypress/Playwright - planned)
- **Fixtures**: Mock data for consistent test states

## Deployment

### Docker Deployment
```bash
# Build and start all services
docker-compose up --build

# Start in detached mode
docker-compose up -d

# Stop and remove containers
docker-compose down

# View logs
docker-compose logs -f
```

### Production Deployment Checklist
1. Set `NODE_ENV=production` in backend/.env
2. Configure proper database connection strings
3. Set strong JWT secrets (minimum 32 characters)
4. Configure Cloudinary credentials for file uploads
5. Set up SMTP for email notifications
6. Configure rate limiting appropriately for expected traffic
7. Enable HTTPS termination at reverse proxy level
8. Set up proper CORS origins for production domain
9. Configure logging to external service (ELK, Datadog, etc.)
10. Set up monitoring and alerting for key metrics
11. Configure automated backups for PostgreSQL database
12. Set up CDN for static assets (if applicable)

### Environment Variables for Production
```env
# Backend
NODE_ENV=production
PORT=80
CLIENT_URL=https://uniclubs.yourdomain.com
JWT_SECRET=strong_secret_min_32_chars_here
JWT_REFRESH_SECRET=strong_refresh_secret_min_32_chars_here
BCRYPT_SALT_ROUNDS=12
# ... other production-specific values
```

## Contributing

We welcome contributions to UniClubs! Please follow these guidelines:

### Getting Started
1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Ensure your code passes linting and tests
5. Submit a pull request

### Development Guidelines
- Follow the existing code style (ESLint/Prettier)
- Write meaningful commit messages
- Add tests for new features or bug fixes
- Update documentation as needed
- Keep pull requests focused and well-described

### Code Style
- JavaScript: StandardJS with Airbnb base rules
- Commit Messages: Conventional Commits format
- PR Template: Use the provided pull request template
- Branching: `feature/*`, `bugfix/*`, `docs/*`, `refactor/*`

### Reporting Issues
Please use the GitHub Issues tracker to report bugs or request features. Include:
- Clear description of the issue
- Steps to reproduce (if applicable)
- Expected vs actual behavior
- Screenshots or logs (if helpful)
- Environment details (browser, version, etc.)

### License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- University club administrators who provided insights into operational needs
- Student organizations that tested early prototypes
- Open source contributors whose libraries make this project possible
- The academic community for fostering collaboration and innovation

---

**UniClubs** - Empowering university communities through technology.

*Last updated: May 15, 2026*