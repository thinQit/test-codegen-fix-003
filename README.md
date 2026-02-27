# Task Manager

A simple Task Manager web application with user authentication, task CRUD operations, and a metrics dashboard.

## Features
- JWT-based authentication (register/login/logout)
- Task creation, editing, deletion, and search/filtering
- Dashboard metrics and recent tasks
- Responsive, accessible UI built with Tailwind CSS
- Prisma ORM with SQLite for development

## Tech Stack
- Next.js 14 (App Router)
- React 18 + TypeScript
- Prisma ORM + SQLite
- Tailwind CSS
- Jest + React Testing Library
- Playwright

## Prerequisites
- Node.js 18+
- npm

## Quick Start
```bash
./install.sh
```
Or on Windows:
```powershell
./install.ps1
```
Then start the dev server:
```bash
npm run dev
```

## Environment Variables
Copy `.env.example` to `.env` and update values:
- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_API_URL`

## Project Structure
```
src/
  app/           # Next.js routes and layouts
  components/    # UI and layout components
  lib/           # Utilities and API client
  providers/     # Global providers (auth, toast)
  types/         # Shared TypeScript types
prisma/          # Prisma schema and migrations
```

## API Endpoints
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api/dashboard`

## Available Scripts
- `npm run dev` - Start dev server
- `npm run build` - Generate Prisma client and build
- `npm run start` - Start production server
- `npm run lint` - Lint
- `npm run test` - Run unit tests
- `npm run test:watch` - Watch tests
- `npm run test:e2e` - Playwright tests

## Testing
- Unit tests: `npm run test`
- E2E tests: `npm run test:e2e`

## Notes
- For production, use `prisma migrate` and set a strong `JWT_SECRET`.
