# Story 1.1: Initialize Project Monorepo & Infrastructure

Status: review

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

- ✅ Verified all infrastructure setup matches requirements.
- ✅ Backend correctly configured with Prisma, Express, and running.
- ✅ Frontend Vite React configured and running.
- ✅ Checked off all pending tasks and updated story status to "review".

### File List

- backend/package.json
- backend/tsconfig.json
- backend/src/server.ts
- backend/prisma/schema.prisma
- frontend/package.json
- frontend/vite.config.ts
- docker-compose.yml
