# Story 2.1: Admin Exam Management API (Backend)

Status: done

## Story

As an Admin,
I want to create, update, and manage Exam structures, Sections, Questions, and Answer Keys via API,
So that the system has exam content available for students to take.

## Acceptance Criteria

1. **Given** an authenticated Admin user
   **When** I send a POST request with valid exam, section, and question data to `/api/v1/exams`
   **Then** the exam is saved to the database along with sections and questions using Prisma transactions
   **And** the API returns the created `examId` with a `success: true` status.

2. **Given** any authenticated user (Student or Admin)
   **When** I send a GET request to `/api/v1/exams` with optional query params `type`, `page`, and `limit`
   **Then** the API returns a paginated list of exams matching the filters (excluding passage text/audio/questions to optimize size).

3. **Given** any authenticated user
   **When** I send a GET request to `/api/v1/exams/:id`
   **Then** the API returns the exam details along with all sections and questions.

4. **Given** an authenticated Admin user
   **When** I send a PUT request to `/api/v1/exams/:id` with updated exam details
   **Then** the database updates the exam, sections, and questions accordingly.

5. **Given** an authenticated Admin user
   **When** I send a DELETE request to `/api/v1/exams/:id`
   **Then** the exam, its sections, and questions are deleted from the database.

6. **Given** an authenticated Admin user
   **When** I send a POST request with an array of exams to `/api/v1/exams/bulk-import`
   **Then** the system bulk creates the exams and returns the status of each import.

7. **Given** a Student attempting to mutate exams (POST, PUT, DELETE)
   **When** they send a request to `/api/v1/exams`
   **Then** the server denies access and returns a `403 Forbidden` error.

## Tasks / Subtasks

- [ ] Task 1: Create Admin Role Guard Middleware
  - Check role of authenticated user (`req.user.role === 'ADMIN'`).
- [ ] Task 2: Create Exam Service
  - Implement functions for CRUD operations on `Test`, `TestSection`, and `Question`.
  - Implement bulk import logic.
- [ ] Task 3: Create Exam Controller
  - Map HTTP requests to service layer and format responses.
- [ ] Task 4: Create Exam Routes
  - Register endpoints under `/api/v1/exams`.
- [ ] Task 5: Write Integration Tests
  - Write test cases for CRUD operations and authorization rules.

## Dev Notes

- **Standard Response Format:**
  - Success: `{ success: true, data: ... }`
  - Error: `{ success: false, error: { code: ..., message: ... } }`
- **Cascade Deletes:** Ensure deleting an exam clean up all associated sections and questions.
- **Transactions:** Use Prisma transaction (`prisma.$transaction`) when creating/updating exams with nested sections and questions to maintain db consistency.

## References

- Project Context: [docs/project-context.md](file:///e:/ProjectKi7/SDN_EnglishLearning/docs/project-context.md)
- Architecture Specs: [_bmad-output/planning-artifacts/architecture.md](file:///e:/ProjectKi7/SDN_EnglishLearning/_bmad-output/planning-artifacts/architecture.md)
