---
stepsCompleted: [1, 2, 3]
inputDocuments: ["docs/project-context.md", "_bmad-output/planning-artifacts/architecture.md"]
---

# SDN_EnglishLearning - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for SDN_EnglishLearning, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: System must provide an Exam Mode for full Listening & Reading exams with a real-time timer, hidden transcript, and split-screen interface.
FR2: System must provide a Practice Mode allowing free practice per part/section with togglable synchronized transcripts.
FR3: System must provide Review & Analytics that return converted scores, detailed explanations, and paraphrasing highlights between questions and source material.
FR4: System must support AI Speaking assessment that records audio, processes STT, and returns detailed Gemini API scores across 4 specific criteria.
FR5: System must provide a Mentor Booking feature that allows viewing schedules and directly booking slots with real-time locking.
FR6: System must provide an Admin Dashboard for managing exams, updating Cambridge answer keys, and approving Mentor profiles.
FR7: System must support 3 distinct user roles (Student, Mentor, Admin) authenticated via JWT.

### NonFunctional Requirements

NFR1: System must handle Mentor Booking race conditions ensuring a 0% conflict rate by blocking concurrent requests at the memory level (Redis).
NFR2: AI Speaking scoring process must complete and return results within 7 seconds.
NFR3: Frontend must gracefully handle Audio Interruptions (network drop or mic permission loss) without throwing server errors, allowing users to retry.
NFR4: Application UI must be fully responsive, specifically optimized for Desktop and Tablet views (Mobile app is out of scope).
NFR5: System must use HttpOnly Cookies for storing Refresh Tokens to ensure security.

### Additional Requirements

- [Architecture] Infrastructure requires initializing a Vite React + Express TS + Prisma template as the first story.
- [Architecture] WebSocket (Socket.io) must be used exclusively for Audio Streaming; REST APIs must be used for standard CRUD operations.
- [Architecture] Database integrity must be maintained using MongoDB Unique Compound Index `(mentorId, timeSlot)` as a fallback to Redis locking.
- [Architecture] Frontend state management must use Redux Toolkit, and all Socket.io listeners must be encapsulated within a Custom Redux Middleware.
- [Architecture] API responses must strictly follow the defined standard format (e.g., `{ success: true, data: ... }`).

### UX Design Requirements

*No UX Design document available for extraction.*

### FR Coverage Map

FR1: Epic 2 - Exam Mode (Listening/Reading)
FR2: Epic 2 - Practice Mode (Section practice & transcripts)
FR3: Epic 2 - Review & Analytics (Scoring, explanations, paraphrasing)
FR4: Epic 3 - AI Speaking Assessment (STT, Gemini API)
FR5: Epic 4 - Mentor Booking System
FR6: Epic 2 (Exam Management) & Epic 4 (Mentor Approval)
FR7: Epic 1 - User Authentication & Roles

## Epic List

### Epic 1: Access Management & Platform Core
**Goal:** Establish the foundation of the project (Vite + Express + Prisma) and enable Students, Mentors, and Admins to securely log in and access their respective environments.
**FRs covered:** FR7

### Story 1.1: Initialize Project Monorepo & Infrastructure

As a Developer,
I want to set up the foundational project architecture (Vite React, Express TS, Prisma, Docker for Redis/Mongo),
So that the team has a unified, scalable environment to begin development.

**Acceptance Criteria:**

**Given** the backend server is running
**When** I call the `/health` API endpoint
**Then** it returns `{ success: true }`
**And** the frontend Vite server starts successfully on port 3000
**And** Prisma successfully connects to the local MongoDB instance.

### Story 1.2: Implement Authentication API (Backend)

As a User,
I want to securely register and log in to the system,
So that my role (Student/Mentor/Admin) is recognized and my data is protected.

**Acceptance Criteria:**

**Given** valid login credentials
**When** I send a request to `/api/auth/login`
**Then** the server returns an Access Token in the response body
**And** a Refresh Token is set in an HttpOnly Cookie
**And** passwords must be hashed using bcrypt in the database.

### Story 1.3: Implement Frontend Authentication State & Routing

As a User,
I want to see login/register pages and be prevented from accessing internal pages without logging in,
So that my access is properly restricted based on my authentication status.

**Acceptance Criteria:**

**Given** an unauthenticated state
**When** I attempt to access a protected route like `/admin`
**Then** I am automatically redirected to `/login`
**And** Redux Toolkit authSlice successfully manages and persists the user session state.

### Story 1.4: Implement Socket.io Infrastructure & Redux Middleware

As a Developer,
I want to configure the base Socket.io server and Redux Custom Middleware,
So that real-time features (Audio Streaming, Locking) can be easily integrated in future epics.

**Acceptance Criteria:**

**Given** the frontend application is loaded and the user is authenticated
**When** the Socket.io client initializes
**Then** it successfully connects to the backend Socket server
**And** the Redux Custom Middleware correctly intercepts and dispatches basic socket events.

### Epic 2: The Exam Engine & Content
**Goal:** Enable Admins to upload exams, and Students to take mock exams, practice, and review their results with detailed analytics and paraphrasing highlights. Delivers a complete end-to-end exam loop.
**FRs covered:** FR1, FR2, FR3, FR6 (partial - Exam Content Management)

### Story 2.1: Admin Exam Management API (Backend)

As an Admin,
I want to create, update, and manage Exam structures, Sections, Questions, and Answer Keys via API,
So that the system has exam content available for students to take.

**Acceptance Criteria:**

**Given** an authenticated Admin user
**When** I send a POST request with valid exam data to `/api/exams`
**Then** the exam and its related sections/questions are saved to the database
**And** the API returns the created `examId` with a success status.

### Story 2.2: Admin Exam Management UI (Frontend)

As an Admin,
I want a dashboard interface to easily upload and manage exam content,
So that I don't have to interact directly with the database.

**Acceptance Criteria:**

**Given** I am on the Admin Dashboard
**When** I fill out the exam creation form and submit
**Then** the form is validated on the client side
**And** it successfully calls the Exam Management API to create the exam.

### Story 2.3: Exam Engine Core UI & Timer (Frontend)

As a Student,
I want to take an exam in a split-screen interface with a real-time countdown timer,
So that I can simulate a real test environment.

**Acceptance Criteria:**

**Given** I have started an exam
**When** the exam screen loads
**Then** I see the reading/listening material on the left and questions on the right
**And** a real-time countdown timer is running
**And** the exam auto-submits when the timer reaches zero, preserving my answers in Redux state
**And** the Redux state is synchronized with LocalStorage/SessionStorage on every answer selection, ensuring no data loss if the page is reloaded (F5) or accidentally closed.

### Story 2.4: Exam Submission & Grading API (Backend)

As a Student,
I want to submit my exam answers and receive an instantly calculated score,
So that I know my current proficiency level (Band score).

**Acceptance Criteria:**

**Given** a completed exam submission payload
**When** I submit to `/api/exams/{id}/submit`
**Then** the backend compares my answers against the Cambridge Answer Key
**And** calculates the number of correct answers
**And** returns the converted IELTS Band Score (1.0 - 9.0).

### Story 2.5: Practice Mode with Transcripts (Frontend)

As a Student,
I want to practice specific sections and toggle transcripts on/off,
So that I can focus on my weak areas and follow along with audio recordings.

**Acceptance Criteria:**

**Given** I am in Practice Mode
**When** I click the "Toggle Transcript" button during a listening section
**Then** the textual transcript appears/disappears next to the audio player
**And** the timer is either disabled or can be paused.

### Story 2.6: Review & Analytics UI (Frontend)

As a Student,
I want to review my submitted exams with detailed explanations and paraphrasing highlights,
So that I can learn from my mistakes.

**Acceptance Criteria:**

**Given** I am viewing a graded exam result
**When** the review page loads
**Then** incorrect answers are highlighted in red and correct ones in green
**And** specific paraphrased words/phrases between the question and the source text are highlighted in bold or a distinct color.

### Epic 3: AI Speaking Assessment
**Goal:** Enable students to practice speaking anytime, record their voice, and receive instant, granular scoring (based on BC/IDP criteria) using AI.
**FRs covered:** FR4

### Story 3.1: Audio Recording & Microphone Handling (Frontend)

As a Student,
I want to record my voice using a simple recording button and have it gracefully handle errors if my mic disconnects,
So that I can complete the speaking test without the app crashing.

**Acceptance Criteria:**

**Given** I have granted microphone permissions
**When** I click the "Start Recording" button
**Then** a blinking indicator shows it is currently recording (no complex waveform required)
**And** if the connection is lost (`oniceconnectionstatechange`) or mic is unplugged, the recording pauses and shows a Toast notification to retry without throwing server errors
**And** the "Start Recording" button must be visually disabled (dimmed) while requesting microphone permissions, only becoming active after permission is granted.

### Story 3.2: Socket.io Audio Receiver & Speech-to-Text (Backend)

As a System,
I want to receive audio chunks from the frontend via Socket.io and convert them to text using STT,
So that the input can be processed quickly for AI scoring.

**Acceptance Criteria:**

**Given** the frontend is streaming audio chunks via Socket.io
**When** the backend receives the audio stream
**Then** it converts the audio into text (STT)
**And** ensures REST APIs are bypassed for this high-speed streaming task
**And** the audio file/buffer is held in memory/cache temporarily, and only deleted AFTER successful scoring from Gemini API (or cleaned up after a 15-minute timeout) to allow retries in case of API failures.

### Story 3.3: Gemini API Prompting & Scoring Service (Backend)

As a System,
I want to send the transcribed text to the Gemini API with a specialized prompt to get IELTS band scores,
So that the student receives an accurate evaluation.

**Acceptance Criteria:**

**Given** the transcribed text from STT
**When** the system sends the specialized prompt to the Gemini API
**Then** the API returns a structured JSON containing the scores for Fluency, Lexical Resource, Grammar, and Pronunciation
**And** the entire process from audio completion to returning the JSON score must be completed in under 7 seconds.

### Story 3.4: Speaking Assessment Results UI (Frontend)

As a Student,
I want to see my AI-generated Speaking scores displayed in a clear and visual manner,
So that I can quickly understand my performance.

**Acceptance Criteria:**

**Given** the JSON scoring data is received from the backend
**When** I view the results page
**Then** my scores for the 4 IELTS criteria are displayed using visual charts or progress bars
**And** the system does not need to provide playback of the recording (since audio is deleted post-scoring).

### Epic 4: Mentor & Booking Ecosystem
**Goal:** Enable Admins to approve mentors, Mentors to manage their availability, and Students to securely book 1-on-1 sessions with zero risk of scheduling conflicts.
**FRs covered:** FR5, FR6 (partial - Mentor Profiles Management)

### Story 4.1: Mentor Approval & Profile API (Admin & Mentor)

As an Admin,
I want to review and approve Mentor registrations,
So that only qualified mentors are allowed to create booking timeslots on the platform.

**Acceptance Criteria:**

**Given** a newly registered Mentor account
**When** the Admin clicks "Approve" on the dashboard
**Then** the Mentor's status is updated to "Active" in the database
**And** the Mentor can access the availability management features.

### Story 4.2: Mentor Availability Management (Mentor UI & API)

As a Mentor,
I want to create available timeslots and attach external video call links (e.g., Google Meet, Zoom),
So that students can see when I am free and know where to join the session.

**Acceptance Criteria:**

**Given** I am an approved Mentor on the Dashboard
**When** I select a date/time and input my meeting link
**Then** the timeslot is saved as "Available" in the database
**And** it immediately appears on my public booking profile.

### Story 4.3: Concurrency-Safe Booking API (Backend)

As a Developer,
I want to use Redis locking to handle concurrent booking requests,
So that two students can never accidentally book the exact same timeslot.

**Acceptance Criteria:**

**Given** two students attempting to book the same timeslot simultaneously
**When** the booking requests hit the `/api/bookings` endpoint
**Then** the backend uses a Redis `SETNX` lock on the timeslot ID
**And** the lock automatically expires after 10 seconds (TTL) to prevent permanent deadlocks if the server crashes
**And** the first request acquires the lock and successfully books the slot (200 OK)
**And** the second request fails to acquire the lock and returns a 409 Conflict error.

### Story 4.4: Mentor Browsing & Booking UI (Student UI)

As a Student,
I want to browse mentors, view their available timeslots, and book a session,
So that I can receive 1-on-1 coaching.

**Acceptance Criteria:**

**Given** I am on a Mentor's profile
**When** I click an "Available" timeslot and confirm booking
**Then** the UI updates the slot to "Booked"
**And** if my request was rejected due to concurrency (409 error), I see a Toast notification saying "Timeslot was just booked by someone else" and the UI refreshes to show the updated availability.
