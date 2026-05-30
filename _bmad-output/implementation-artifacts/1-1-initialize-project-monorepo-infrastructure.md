# Story 1.1: Initialize Project Monorepo & Infrastructure

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Developer,
I want to set up the foundational project architecture (Vite React, Express TS, Prisma, Docker for Redis/Mongo),
so that the team has a unified, scalable environment to begin development.

## Acceptance Criteria

1. **Given** the backend server is running, **When** I call the `/health` API endpoint, **Then** it returns `{ success: true }`.
2. **Given** the frontend Vite server starts successfully on port 3000.
3. **Given** Prisma successfully connects to the local MongoDB instance.

## Tasks / Subtasks

- [x] Task 1: Setup Backend Foundation (AC: 1, 3)
  - [x] Initialize Node.js backend directory (`backend/`)
  - [x] Install Express, Mongoose, Redis, Socket.io, JSONWebToken and their types
  - [x] Setup TypeScript (`tsconfig.json`)
  - [x] Setup Prisma ORM with MongoDB connection
  - [x] Implement `/health` API endpoint
  - [x] Setup global error middleware and HTTP request routing structure
- [x] Task 2: Setup Frontend Foundation (AC: 2)
  - [x] Initialize Vite React TypeScript frontend (`frontend/`)
  - [x] Install TailwindCSS, Zustand, Socket.io-client
  - [x] Configure Vite to run on port 3000
  - [x] Setup basic folder structure (`components`, `features`, `store`, etc.)
- [x] Task 3: Setup DevOps / Docker
  - [x] Create `docker-compose.yml` for local MongoDB and Redis instances

## Dev Notes

- **Architecture:** Polyrepo structure with Vite React (Frontend) and Express TS (Backend).
- **Initialization Command:** Check `architecture.md` for the exact initialization commands required by the PM.
- **Port requirements:** Frontend MUST run on port 3000.
- **Error Handling:** Backend MUST use a global error middleware. API responses MUST follow `{ "success": true/false, ... }` format.
- **Database:** Prisma ORM for MongoDB. Ensure `User` schema basics are ready.
- **Naming Conventions:** `PascalCase` for Prisma Models. `kebab-case` for APIs. React Components `PascalCase`.

### Project Structure Notes

- Alignment with unified project structure:
  - `backend/src/routes`, `backend/src/controllers`, `backend/src/middlewares`, `backend/src/utils`
  - `frontend/src/features`, `frontend/src/components`, `frontend/src/hooks`, `frontend/src/store`

### References

- Project Context: [docs/project-context.md](file:///d:/hoc/FPT/Semester7/SDN/project/SDN_EnglishLearning/docs/project-context.md)
- Architecture Specs: [_bmad-output/planning-artifacts/architecture.md](file:///d:/hoc/FPT/Semester7/SDN/project/SDN_EnglishLearning/_bmad-output/planning-artifacts/architecture.md)
- Epics List: [_bmad-output/planning-artifacts/epics.md](file:///d:/hoc/FPT/Semester7/SDN/project/SDN_EnglishLearning/_bmad-output/planning-artifacts/epics.md)

## Dev Agent Record

### Agent Model Used

Gemini

### Debug Log References

None

### Completion Notes List

Ultimate context engine analysis completed - comprehensive developer guide created

- Validated backend is properly initialized with Prisma, Redis, and Express.
- Fixed frontend: Replaced incorrect Expo/React Native frontend with Vite React TypeScript.
- Configured Vite port to 3000 and setup TailwindCSS/PostCSS.
- Setup fundamental frontend directory structure (components, features, hooks, store, services, assets).
- Marked story as `review` for next steps.

### File List

- backend/package.json
- backend/tsconfig.json
- backend/src/server.ts
- backend/prisma/schema.prisma
- frontend/package.json
- frontend/vite.config.ts
- frontend/tailwind.config.js
- frontend/postcss.config.js
- docker-compose.yml

### Review Findings

- [x] [Review][Decision] Use of unstructured JSON fields in schema — User decided to keep JSON for flexibility and handle validation at Application level (e.g., Zod).
- [x] [Review][Patch] Missing `uncaughtException` handler [backend/src/server.ts]
- [x] [Review][Patch] Missing `res.headersSent` check in error middleware [backend/src/middlewares/error.middleware.ts]
- [x] [Review][Patch] Health check lacks timeout on database ping [backend/src/routes/health.routes.ts]
- [x] [Review][Patch] Dependency versioning issues (TypeScript version) [frontend/package.json]
- [x] [Review][Patch] Lack of graceful shutdown timeout [backend/src/server.ts]
- [x] [Review][Patch] Unguarded CORS origin configuration [backend/src/app.ts]
- [x] [Review][Patch] Improper Redis connection error handling [backend/src/server.ts]
- [x] [Review][Patch] Insecure Docker configuration (hardcoded secrets) [docker-compose.yml]
