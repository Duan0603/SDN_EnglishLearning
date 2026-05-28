# Story 1.2: Implement Authentication API (Backend)

Status: ready-for-dev

## Story

As a User,
I want to securely register and log in to the system,
So that my role (Student/Mentor/Admin) is recognized and my data is protected.

## Acceptance Criteria

1. **Given** valid signup details (username, email, password, fullName)
   **When** I send a POST request to `/api/v1/auth/signup` or `/api/v1/access/signup`
   **Then** the user is created in the database with their password hashed using bcrypt
   **And** the server returns an Access Token in the response body
   **And** a Refresh Token is set in an HttpOnly Cookie.

2. **Given** valid login credentials (email or username, password)
   **When** I send a POST request to `/api/v1/auth/login` or `/api/v1/access/login`
   **Then** the server verifies the password using bcrypt
   **And** returns an Access Token in the response body
   **And** a Refresh Token is set in an HttpOnly Cookie.

3. **Given** an authenticated user
   **When** I send a POST request to `/api/v1/auth/logout` or `/api/v1/access/logout`
   **Then** the server clears the Refresh Token HttpOnly Cookie
   **And** removes the KeyToken record associated with the user session from the database.

## Tasks / Subtasks

- [x] Task 1: Check Mongoose Models and Controllers
  - Verify `user.model.js` and `keyToken.model.js` are correctly configured
  - Verify `access.controller.js` and `access.service.js` contain logic for signUp, login, and logout
- [x] Task 2: Expose endpoints under `/api/v1/auth` as well as `/api/v1/access` for backward compatibility
  - Expose `/api/v1/auth/signup`, `/api/v1/auth/login`, `/api/v1/auth/logout`
- [x] Task 3: Handle CORS with Credentials Support
  - Adjust backend CORS middleware in `app.ts` to support explicit client origin (`http://localhost:3000`) instead of wildcard `*` when credentials mode is enabled.

## Dev Notes

- **Password Hashing:** Use `bcryptjs` for security.
- **Cookies:** Keep `refreshToken` cookie secure, httpOnly, sameSite `strict`, expiring in 7 days.
- **CORS:** Ensure `credentials: true` and an explicit origin array/check.

## References

- Project Context: [docs/project-context.md](file:///e:/ProjectKi7/SDN_EnglishLearning/docs/project-context.md)
- Architecture Specs: [_bmad-output/planning-artifacts/architecture.md](file:///e:/ProjectKi7/SDN_EnglishLearning/_bmad-output/planning-artifacts/architecture.md)

## Dev Agent Record

### Agent Model Used

Gemini

### Debug Log References

None

### Completion Notes List

Authentication API endpoints implemented, CORS configured for credentials support, verified endpoints.

### File List

- backend/src/routes/index.ts
- backend/src/app.ts
