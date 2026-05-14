$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

function New-EmptyFile {
	param([string]$Path)
	New-Item -ItemType File -Force -Path $Path | Out-Null
}

function Write-File {
	param(
		[string]$Path,
		[string]$Content
	)
	Set-Content -Path $Path -Value $Content -NoNewline
}

$directories = @(
	'backend',
	'backend/src',
	'backend/src/config',
	'backend/src/middleware',
	'backend/src/db',
	'backend/src/db/migrations',
	'backend/src/db/seeds',
	'backend/src/modules',
	'backend/src/modules/auth',
	'backend/src/modules/users',
	'backend/src/modules/clubs',
	'backend/src/modules/events',
	'backend/src/modules/posts',
	'backend/src/modules/notifications',
	'backend/src/modules/analytics',
	'backend/src/modules/admin',
	'backend/src/modules/ai',
	'backend/src/jobs',
	'backend/src/jobs/processors',
	'backend/src/utils',
	'backend/src/websocket',
	'frontend',
	'frontend/public',
	'frontend/src',
	'frontend/src/api',
	'frontend/src/components',
	'frontend/src/components/common',
	'frontend/src/components/layout',
	'frontend/src/pages',
	'frontend/src/pages/Clubs',
	'frontend/src/pages/Events',
	'frontend/src/pages/Admin',
	'frontend/src/hooks',
	'frontend/src/store',
	'frontend/src/i18n',
	'frontend/src/i18n/locales',
	'frontend/src/styles',
	'frontend/src/types'
)

foreach ($directory in $directories) {
	New-Item -ItemType Directory -Force -Path (Join-Path $root $directory) | Out-Null
}

Write-File (Join-Path $root '.gitignore') @'
node_modules/
.env
.env.*
dist/
build/
coverage/
*.log
.DS_Store
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
'@

Write-File (Join-Path $root 'README.md') "# UniClubs`n`nUniversity club management platform scaffold.`n"
Write-File (Join-Path $root 'package.json') '{"name":"uniclubs"}'
Write-File (Join-Path $root 'docker-compose.yml') "# UniClubs scaffold placeholder`n"

Write-File (Join-Path $root 'backend/.env.example') @"
PORT=3000
NODE_ENV=development
DATABASE_URL=postgres://postgres:postgres@localhost:5432/uniclubs
REDIS_URL=redis://localhost:6379
JWT_SECRET=change-me
GEMINI_API_KEY=change-me
AWS_REGION=us-east-1
S3_BUCKET=change-me
SES_FROM_EMAIL=no-reply@example.com
"@
Write-File (Join-Path $root 'backend/package.json') '{"name":"uniclubs-backend"}'
New-EmptyFile (Join-Path $root 'backend/knexfile.js')
New-EmptyFile (Join-Path $root 'backend/Dockerfile')
New-EmptyFile (Join-Path $root 'backend/src/index.js')
New-EmptyFile (Join-Path $root 'backend/src/config/index.js')
New-EmptyFile (Join-Path $root 'backend/src/middleware/auth.js')
New-EmptyFile (Join-Path $root 'backend/src/middleware/tenant.js')
New-EmptyFile (Join-Path $root 'backend/src/middleware/validate.js')
New-EmptyFile (Join-Path $root 'backend/src/middleware/errorHandler.js')
New-EmptyFile (Join-Path $root 'backend/src/db/connection.js')
New-EmptyFile (Join-Path $root 'backend/src/db/migrations/.gitkeep')
New-EmptyFile (Join-Path $root 'backend/src/db/seeds/.gitkeep')

$moduleNames = @('auth', 'users', 'clubs', 'events', 'posts', 'notifications', 'analytics', 'admin')
foreach ($moduleName in $moduleNames) {
	New-EmptyFile (Join-Path $root "backend/src/modules/$moduleName/$moduleName.routes.js")
	New-EmptyFile (Join-Path $root "backend/src/modules/$moduleName/$moduleName.service.js")
	New-EmptyFile (Join-Path $root "backend/src/modules/$moduleName/$moduleName.controller.js")
}

New-EmptyFile (Join-Path $root 'backend/src/modules/ai/ai.service.js')
New-EmptyFile (Join-Path $root 'backend/src/modules/ai/ai.prompts.js')
New-EmptyFile (Join-Path $root 'backend/src/jobs/queue.js')
New-EmptyFile (Join-Path $root 'backend/src/jobs/processors/aiModeration.js')
New-EmptyFile (Join-Path $root 'backend/src/jobs/processors/aiRecommendations.js')
New-EmptyFile (Join-Path $root 'backend/src/jobs/processors/emailDigest.js')
New-EmptyFile (Join-Path $root 'backend/src/utils/logger.js')
New-EmptyFile (Join-Path $root 'backend/src/utils/apiResponse.js')
New-EmptyFile (Join-Path $root 'backend/src/utils/s3Upload.js')
New-EmptyFile (Join-Path $root 'backend/src/websocket/socket.js')

Write-File (Join-Path $root 'frontend/package.json') '{"name":"uniclubs-frontend"}'
New-EmptyFile (Join-Path $root 'frontend/index.html')
New-EmptyFile (Join-Path $root 'frontend/vite.config.ts')
New-EmptyFile (Join-Path $root 'frontend/tsconfig.json')
Write-File (Join-Path $root 'frontend/.env.example') "VITE_API_BASE_URL=http://localhost:3000/api/v1`n"
New-EmptyFile (Join-Path $root 'frontend/public/favicon.ico')
New-EmptyFile (Join-Path $root 'frontend/public/manifest.json')
New-EmptyFile (Join-Path $root 'frontend/public/.gitkeep')
New-EmptyFile (Join-Path $root 'frontend/src/main.tsx')
New-EmptyFile (Join-Path $root 'frontend/src/App.tsx')
New-EmptyFile (Join-Path $root 'frontend/src/routes.tsx')

$apiFiles = @('client.ts', 'clubs.ts', 'events.ts', 'posts.ts', 'auth.ts')
foreach ($apiFile in $apiFiles) {
	New-EmptyFile (Join-Path $root "frontend/src/api/$apiFile")
}

New-EmptyFile (Join-Path $root 'frontend/src/api/.gitkeep')
New-EmptyFile (Join-Path $root 'frontend/src/components/.gitkeep')
New-EmptyFile (Join-Path $root 'frontend/src/components/common/Button.tsx')
New-EmptyFile (Join-Path $root 'frontend/src/components/common/Input.tsx')
New-EmptyFile (Join-Path $root 'frontend/src/components/common/Modal.tsx')
New-EmptyFile (Join-Path $root 'frontend/src/components/layout/Navbar.tsx')
New-EmptyFile (Join-Path $root 'frontend/src/components/layout/Sidebar.tsx')
New-EmptyFile (Join-Path $root 'frontend/src/components/layout/Footer.tsx')
New-EmptyFile (Join-Path $root 'frontend/src/pages/.gitkeep')
New-EmptyFile (Join-Path $root 'frontend/src/pages/Dashboard.tsx')
New-EmptyFile (Join-Path $root 'frontend/src/pages/Clubs/.gitkeep')
New-EmptyFile (Join-Path $root 'frontend/src/pages/Clubs/ClubList.tsx')
New-EmptyFile (Join-Path $root 'frontend/src/pages/Clubs/ClubDetail.tsx')
New-EmptyFile (Join-Path $root 'frontend/src/pages/Events/.gitkeep')
New-EmptyFile (Join-Path $root 'frontend/src/pages/Events/EventList.tsx')
New-EmptyFile (Join-Path $root 'frontend/src/pages/Events/EventDetail.tsx')
New-EmptyFile (Join-Path $root 'frontend/src/pages/Admin/.gitkeep')
New-EmptyFile (Join-Path $root 'frontend/src/pages/Admin/AdminDashboard.tsx')
New-EmptyFile (Join-Path $root 'frontend/src/hooks/.gitkeep')
New-EmptyFile (Join-Path $root 'frontend/src/hooks/useAuth.ts')
New-EmptyFile (Join-Path $root 'frontend/src/hooks/useClub.ts')
New-EmptyFile (Join-Path $root 'frontend/src/store/.gitkeep')
New-EmptyFile (Join-Path $root 'frontend/src/store/authStore.ts')
New-EmptyFile (Join-Path $root 'frontend/src/store/uiStore.ts')
New-EmptyFile (Join-Path $root 'frontend/src/i18n/index.ts')
New-EmptyFile (Join-Path $root 'frontend/src/i18n/locales/.gitkeep')
Write-File (Join-Path $root 'frontend/src/i18n/locales/en.json') '{}'
Write-File (Join-Path $root 'frontend/src/i18n/locales/es.json') '{}'
New-EmptyFile (Join-Path $root 'frontend/src/styles/.gitkeep')
New-EmptyFile (Join-Path $root 'frontend/src/styles/globals.css')
New-EmptyFile (Join-Path $root 'frontend/src/types/.gitkeep')
New-EmptyFile (Join-Path $root 'frontend/src/types/index.ts')

Write-Host 'UniClubs scaffold script completed.'