# 7. DATA STRUCTURE

## 7.1 Entity diagram

Here is the Entity-Relationship (ER) Diagram representing the data structure of the **SDN English Learning Platform**. This diagram follows the Chen-like notation similar to your sample: **rectangles** represent core entities, **rounded rectangles** represent relationships (which can also hold attributes), and links denote the cardinality (e.g., `1-1`, `1-n`).

```mermaid
graph TD
    %% Styling Configuration
    classDef entity fill:#FFFFFF,stroke:#333333,stroke-width:2px,rx:2px,ry:2px;
    classDef relation fill:#F9F9F9,stroke:#666666,stroke-width:1.5px,rx:12px,ry:12px;
    
    %% Core Entities (Rectangles)
    User["User<br/>---<br/>• id (PK)<br/>• email<br/>• username<br/>• password<br/>• fullName<br/>• role (Enum)<br/>• avatar<br/>• status<br/>• verify<br/>• createdAt<br/>• updatedAt"]:::entity
    
    KeyToken["KeyToken<br/>---<br/>• id (PK)<br/>• userId (FK)<br/>• publicKey<br/>• refreshToken[]<br/>• refreshTokensUsed[]<br/>• createdAt<br/>• updatedAt"]:::entity
    
    Availability["Availability<br/>---<br/>• id (PK)<br/>• mentorId (FK)<br/>• startTime<br/>• endTime<br/>• isBooked<br/>• createdAt<br/>• updatedAt"]:::entity
    
    Booking["Booking<br/>---<br/>• id (PK)<br/>• studentId (FK)<br/>• mentorId (FK)<br/>• availabilityId (FK)<br/>• startTime<br/>• endTime<br/>• status (Enum)<br/>• notes<br/>• mentorNotes<br/>• createdAt<br/>• updatedAt"]:::entity
    
    Test["Test<br/>---<br/>• id (PK)<br/>• title<br/>• description<br/>• type (Enum)<br/>• duration<br/>• createdAt<br/>• updatedAt"]:::entity
    
    TestSection["TestSection<br/>---<br/>• id (PK)<br/>• testId (FK)<br/>• sectionOrder<br/>• title<br/>• passageText<br/>• audioUrl<br/>• images[]<br/>• createdAt<br/>• updatedAt"]:::entity
    
    Question["Question<br/>---<br/>• id (PK)<br/>• sectionId (FK)<br/>• questionNumber<br/>• type (Enum)<br/>• content<br/>• options (JSON)<br/>• answer<br/>• explanation<br/>• createdAt<br/>• updatedAt"]:::entity
    
    TestResult["TestResult<br/>---<br/>• id (PK)<br/>• userId (FK)<br/>• testId (FK)<br/>• answers (JSON)<br/>• correctCount<br/>• bandScore<br/>• timeTaken<br/>• createdAt"]:::entity
    
    WritingSubmission["WritingSubmission<br/>---<br/>• id (PK)<br/>• userId (FK)<br/>• testId (FK)<br/>• prompt<br/>• essayText<br/>• bandScore<br/>• taskAchievement<br/>• coherenceCohesion<br/>• lexicalResource<br/>• grammarAccuracy<br/>• aiFeedback (JSON)<br/>• createdAt"]:::entity
    
    SpeakingSubmission["SpeakingSubmission<br/>---<br/>• id (PK)<br/>• userId (FK)<br/>• testId (FK)<br/>• prompt<br/>• audioUrl<br/>• transcription<br/>• bandScore<br/>• fluencyCoherence<br/>• lexicalResource<br/>• grammarAccuracy<br/>• pronunciation<br/>• aiFeedback (JSON)<br/>• createdAt"]:::entity

    %% Relationships (Rounded Rectangles)
    Authenticate("Authenticate"):::relation
    DefineAvailability("Define"):::relation
    BookStudent("Booked By"):::relation
    BookMentor("Assigned To"):::relation
    BookSlot("Refers To"):::relation
    TestHasSections("Contain"):::relation
    SectionHasQuestions("Has"):::relation
    TakeTest("Attempt"):::relation
    ResultOfTest("Result Of"):::relation
    UserSubmitWriting("Submit Writing"):::relation
    WritingAssociated("Associated With"):::relation
    UserSubmitSpeaking("Submit Speaking"):::relation
    SpeakingAssociated("Associated With"):::relation

    %% Connections User - KeyToken
    User -- "1-1" --- Authenticate
    Authenticate --- "1-n" --> KeyToken

    %% Connections User - Availability
    User -- "1-1" --- DefineAvailability
    DefineAvailability --- "1-n" --> Availability

    %% Connections User - Booking (Student & Mentor roles)
    User -- "1-1" --- BookStudent
    BookStudent --- "1-n" --> Booking

    User -- "1-1" --- BookMentor
    BookMentor --- "1-n" --> Booking

    Availability -- "1-1" --- BookSlot
    BookSlot --- "1-1" --> Booking

    %% Connections Test - TestSection - Question
    Test -- "1-1" --- TestHasSections
    TestHasSections --- "1-n" --> TestSection

    TestSection -- "1-1" --- SectionHasQuestions
    SectionHasQuestions --- "1-n" --> Question

    %% Connections TestResult
    User -- "1-1" --- TakeTest
    TakeTest --- "1-n" --> TestResult

    Test -- "1-1" --- ResultOfTest
    ResultOfTest --- "1-n" --> TestResult

    %% Connections WritingSubmission
    User -- "1-1" --- UserSubmitWriting
    UserSubmitWriting --- "1-n" --> WritingSubmission

    Test -- "1-1" --- WritingAssociated
    WritingAssociated --- "1-n" --> WritingSubmission

    %% Connections SpeakingSubmission
    User -- "1-1" --- UserSubmitSpeaking
    UserSubmitSpeaking --- "1-n" --> SpeakingSubmission

    Test -- "1-1" --- SpeakingAssociated
    SpeakingAssociated --- "1-n" --> SpeakingSubmission
```

---

## 7.2 Entity Dictionary & Fields

Below is the detailed specification of all the database schemas and relationships corresponding to the **Prisma schema for MongoDB**.

### 1. User Entity
Represents all accounts in the system (Students, Mentors, and Admins).

| Attribute | Type | Key | Description |
| :--- | :--- | :--- | :--- |
| **id** | String (ObjectId) | PK | Unique identifier for each user. |
| **email** | String | Unique | User's email address used for login. |
| **username** | String | Unique | Optional unique display username. |
| **password** | String | - | Hashed password. |
| **fullName** | String | - | User's full name. |
| **role** | Enum (Role) | - | Account access level: `STUDENT`, `MENTOR`, or `ADMIN`. |
| **avatar** | String | - | URL of profile image. |
| **status** | String | - | Account status (e.g., `active`, `inactive`). |
| **verify** | Boolean | - | Email verification status. |
| **createdAt** | DateTime | - | Date and time when the account was registered. |
| **updatedAt** | DateTime | - | Date and time when the account details were last updated. |

* **Relationships:**
  - One user can have many **KeyTokens** (for multiple active sessions).
  - One mentor can have many **Availabilities** (free calendar slots).
  - One student can make many **Bookings**.
  - One mentor can be assigned to many **Bookings**.
  - One student can submit many **TestResults**, **WritingSubmissions**, and **SpeakingSubmissions**.

---

### 2. KeyToken Entity
Used to manage authentication refresh tokens and prevent replay attacks.

| Attribute | Type | Key | Description |
| :--- | :--- | :--- | :--- |
| **id** | String (ObjectId) | PK | Unique token record ID. |
| **userId** | String (ObjectId) | FK | References the `User` who owns the token. |
| **publicKey** | String | - | Public key for token verification. |
| **refreshToken** | String[] | - | Active refresh token list. |
| **refreshTokensUsed** | String[] | - | List of already-expired refresh tokens to detect reuse. |
| **createdAt** | DateTime | - | Token issuance timestamp. |
| **updatedAt** | DateTime | - | Token update timestamp. |

---

### 3. Availability Entity
Defines time slots provided by Mentors for booking.

| Attribute | Type | Key | Description |
| :--- | :--- | :--- | :--- |
| **id** | String (ObjectId) | PK | Unique slot ID. |
| **mentorId** | String (ObjectId) | FK | References the mentor (`User`) offering this slot. |
| **startTime** | DateTime | - | Start time of availability. |
| **endTime** | DateTime | - | End time of availability. |
| **isBooked** | Boolean | - | Status flag indicating if this slot is already occupied. |
| **createdAt** | DateTime | - | Record creation date. |
| **updatedAt** | DateTime | - | Record update date. |

* **Relationships:**
  - Has a **1-to-1** relationship with **Booking**.

---

### 4. Booking Entity
Represents the actual booking event between a Student and a Mentor for a specific Availability slot.

| Attribute | Type | Key | Description |
| :--- | :--- | :--- | :--- |
| **id** | String (ObjectId) | PK | Unique booking ID. |
| **studentId** | String (ObjectId) | FK | References the student (`User`) who booked the slot. |
| **mentorId** | String (ObjectId) | FK | References the mentor (`User`) assigned to this slot. |
| **availabilityId** | String (ObjectId) | FK, Unique | References the specific `Availability` slot. |
| **startTime** | DateTime | - | Start time of the meeting session. |
| **endTime** | DateTime | - | End time of the meeting session. |
| **status** | Enum (BookingStatus) | - | Status of the booking: `PENDING`, `CONFIRMED`, `CANCELLED`. |
| **notes** | String | - | Optional student goal notes for the session. |
| **mentorNotes** | String | - | Feedback comments added by the mentor after the session. |
| **createdAt** | DateTime | - | Booking creation date. |
| **updatedAt** | DateTime | - | Booking modification date. |

---

### 5. Test Entity
Defines practice or full-length IELTS examinations.

| Attribute | Type | Key | Description |
| :--- | :--- | :--- | :--- |
| **id** | String (ObjectId) | PK | Unique test ID. |
| **title** | String | - | Title of the exam (e.g., "Cambridge 18 - Test 1"). |
| **description** | String | - | Brief test information or rules. |
| **type** | Enum (TestType) | - | Skill: `READING`, `LISTENING`, `WRITING`, `SPEAKING`. |
| **duration** | Int | - | Allowed exam duration in minutes. |
| **createdAt** | DateTime | - | Creation timestamp. |
| **updatedAt** | DateTime | - | Update timestamp. |

* **Relationships:**
  - One **Test** has many **TestSections** (1-n).
  - One **Test** can be taken many times, yielding many **TestResults**, **WritingSubmissions**, or **SpeakingSubmissions** (1-n).

---

### 6. TestSection Entity
Sections or reading passages belonging to a specific IELTS test.

| Attribute | Type | Key | Description |
| :--- | :--- | :--- | :--- |
| **id** | String (ObjectId) | PK | Unique section ID. |
| **testId** | String (ObjectId) | FK | References the parent `Test`. |
| **sectionOrder** | Int | - | The section number (e.g., Section 1, Passage 1). |
| **title** | String | - | Title of the passage or section. |
| **passageText** | String | - | Reading passage context (supporting Markdown/HTML). |
| **audioUrl** | String | - | Listening section audio URL. |
| **images** | String[] | - | Task 1 diagrams or cue-card graphics. |
| **createdAt** | DateTime | - | Section registration date. |
| **updatedAt** | DateTime | - | Section modification date. |

* **Relationships:**
  - One **TestSection** contains many **Questions** (1-n).

---

### 7. Question Entity
Individual exam questions inside a test section.

| Attribute | Type | Key | Description |
| :--- | :--- | :--- | :--- |
| **id** | String (ObjectId) | PK | Unique question ID. |
| **sectionId** | String (ObjectId) | FK | References the parent `TestSection`. |
| **questionNumber** | Int | - | Number ordering of the question (e.g., 1 to 40). |
| **type** | Enum (QuestionType)| - | Question category: `MULTIPLE_CHOICE`, `FILL_IN_BLANKS`, etc. |
| **content** | String | - | Actual question text or prompt. |
| **options** | Json | - | Array of options for selection-based questions. |
| **answer** | String | - | Correct solution for automated grading. |
| **explanation** | String | - | Detailed rationale/explanation for the answer. |
| **createdAt** | DateTime | - | Question creation date. |
| **updatedAt** | DateTime | - | Question update date. |

---

### 8. TestResult Entity
Aggregates student scores after completing a Reading or Listening Test.

| Attribute | Type | Key | Description |
| :--- | :--- | :--- | :--- |
| **id** | String (ObjectId) | PK | Unique result record ID. |
| **userId** | String (ObjectId) | FK | References the student (`User`) who took the test. |
| **testId** | String (ObjectId) | FK | References the completed `Test`. |
| **answers** | Json | - | Raw user answers: `[{ questionId: String, userAnswer: String }]`. |
| **correctCount** | Int | - | Number of correct questions. |
| **bandScore** | Float | - | Calculated IELTS Band Score (e.g., 6.5, 7.0, 9.0). |
| **timeTaken** | Int | - | Elapsed time in seconds. |
| **createdAt** | DateTime | - | Examination timestamp. |

---

### 9. WritingSubmission Entity
Records essay details and feedback generated by AI for Writing tasks.

| Attribute | Type | Key | Description |
| :--- | :--- | :--- | :--- |
| **id** | String (ObjectId) | PK | Unique submission ID. |
| **userId** | String (ObjectId) | FK | References the student (`User`). |
| **testId** | String (ObjectId) | FK (Opt) | References the related `Test` (null if free practice). |
| **prompt** | String | - | Free-writing prompt topic details. |
| **essayText** | String | - | The essay submitted by the student. |
| **bandScore** | Float | - | Overal IELTS Band Score calculated by AI. |
| **taskAchievement**| Float | - | Band score for Task Achievement/Response. |
| **coherenceCohesion**| Float | - | Band score for Coherence and Cohesion. |
| **lexicalResource** | Float | - | Band score for Lexical Resource (Vocabulary). |
| **grammarAccuracy** | Float | - | Band score for Grammatical Range and Accuracy. |
| **aiFeedback** | Json | - | Structure of detailed AI feedback (grammar errors, suggestions). |
| **createdAt** | DateTime | - | Submission timestamp. |

---

### 10. SpeakingSubmission Entity
Records audio submissions and AI speaking scores.

| Attribute | Type | Key | Description |
| :--- | :--- | :--- | :--- |
| **id** | String (ObjectId) | PK | Unique speaking submission ID. |
| **userId** | String (ObjectId) | FK | References the student (`User`). |
| **testId** | String (ObjectId) | FK (Opt) | References the related `Test` (null if free practice). |
| **prompt** | String | - | Speaking topic details. |
| **audioUrl** | String | - | URL of recorded file (stored on Cloudinary). |
| **transcription** | String | - | Text output translated by Whisper STT. |
| **bandScore** | Float | - | Overall IELTS speaking band score. |
| **fluencyCoherence**| Float | - | Score for Fluency and Coherence. |
| **lexicalResource** | Float | - | Score for Lexical Resource. |
| **grammarAccuracy** | Float | - | Score for Grammatical Range and Accuracy. |
| **pronunciation** | Float | - | Score for Pronunciation. |
| **aiFeedback** | Json | - | Structured AI feedback on pronunciation, errors, and vocabulary. |
| **createdAt** | DateTime | - | Submission timestamp. |
