# Story 2.2: Admin Exam Management UI (Frontend)

Status: ready-for-dev

## Story

As an Admin,
I want to manage exams (Tests, Sections, Questions, Answer Keys) via a visual Dashboard,
So that I can easily create, view, edit, delete, and bulk-import IELTS listening/reading exams without using database tools.

## Acceptance Criteria

1. **Given** an authenticated Admin user
   **When** I load the Home Screen
   **Then** I should see an "Admin Dashboard" or "Manage Exams" navigation link/button that is hidden from regular Students.

2. **Given** an Admin on the Admin Dashboard
   **When** I access the Exam Management tab
   **Then** I should see a paginated list of existing exams (including Title, Type, Duration, and Date Created) with search and filter controls (by Type).

3. **Given** an Admin on the Exam List Screen
   **When** I click "Create Exam"
   **Then** I should be presented with a form supporting:
   - Exam Title, Type (READING, LISTENING, etc.), and Duration (in minutes).
   - Dynamic adding/removing of sections (Section Title, Passage content, Audio URL if LISTENING).
   - Dynamic adding/removing of questions per section (Question number, Question type, Question content/options, and correct Answer key).

4. **Given** an Admin editing an exam
   **When** I submit the form
   **Then** the UI validates the input fields (e.g. title is not empty, duration is positive) and calls the backend `PUT /api/v1/exams/:id` endpoint.

5. **Given** an Admin viewing the Exam List Screen
   **When** I click the "Delete" button next to an exam
   **Then** a confirmation modal is shown to prevent accidental deletion
   **And** confirming it triggers `DELETE /api/v1/exams/:id` and refreshes the exam list.

6. **Given** an Admin wanting to load Cambridge exam keys quickly
   **When** I click "Bulk Import"
   **Then** I can paste a Cambridge JSON dataset into a text area and submit it to the backend `POST /api/v1/exams/bulk-import`.

## Tasks / Subtasks

- [ ] Task 1: Add Admin Link to Home Screen
  - Update `HomeScreen.js` to conditionally render the "Admin Portal" or "Manage Exams" button based on `user.role === 'ADMIN'`.
- [ ] Task 2: Create Admin Navigation & Router Configuration
  - Add Admin screens to navigation stack (`src/navigation/index.js` or app router).
- [ ] Task 3: Implement Exam List Screen
  - Fetch list of exams using `GET /api/v1/exams` with search, filter, and pagination support.
  - Display with modern, clean, premium typography and styling matching the platform's theme.
- [ ] Task 4: Implement Exam Creator/Editor Screen
  - Multi-section form supporting dynamic section additions and nested questions.
  - Integrate client-side validation (non-empty fields, positive numeric validation).
- [ ] Task 5: Implement Bulk Import Screen
  - Standard text area allowing JSON input for raw Cambridge exam payload schemas.
- [ ] Task 6: Add Confirmation Modals & Delete Flow
  - Delete dialogs and active state loading/toast feedbacks.

## Dev Notes

- **Aesthetics & Styles**:
  - Keep the design clean, minimalist, and premium, utilizing React Native Paper and NativeWind.
  - Use high-contrast interactive states, curated emerald/mint palette (`#00CC99`), and Outfit fonts to match the existing user interface.
- **State Store**:
  - Integrate with `useAuthStore` to ensure only users with the `ADMIN` role can route to or access these views.
- **API Client Integration**:
  - Ensure all request calls are routed through `src/api/client.js` which automatically attaches the user's `Authorization: Bearer <token>` header.

## References

- Project Context: [docs/project-context.md](file:///e:/ProjectKi7/SDN_EnglishLearning/docs/project-context.md)
- Backend Exam API specification: [_bmad-output/implementation-artifacts/2-1-admin-exam-management-api-backend.md](file:///e:/ProjectKi7/SDN_EnglishLearning/_bmad-output/implementation-artifacts/2-1-admin-exam-management-api-backend.md)
