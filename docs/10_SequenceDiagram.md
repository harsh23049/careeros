# CareerOS Sequence Diagrams

---

# 1. Job Description Analysis

User

↓

Opens Job Page

↓

Chrome Extension

↓

Extract Job Description

↓

Backend

↓

AI Service

↓

LLM

↓

AI Response

↓

Backend

↓

Extension

↓

Display Analysis

---

# 2. Resume Recommendation

User

↓

Click "Recommend Resume"

↓

Extension

↓

Backend

↓

Read User Resumes

↓

AI Service

↓

Compare Resume with JD

↓

Best Resume Selected

↓

Backend

↓

Extension

↓

Display Recommendation

---

# 3. Cover Letter Generation

User

↓

Click Generate Cover Letter

↓

Extension

↓

Backend

↓

AI Service

↓

Generate Cover Letter

↓

Backend

↓

Extension

↓

Preview Cover Letter

↓

User Approves

---

# 4. Application Form Filling

User opens application page

↓

Extension detects form

↓

Read input fields

↓

Read textareas

↓

Backend

↓

Retrieve User Data

↓

AI generates descriptive answers

↓

Backend returns

↓

Extension fills

- Name
- Email
- Phone
- Links
- Cover Letter
- HR Questions

↓

User Reviews

↓

User Clicks Submit

---

# 5. Save Job

User

↓

Click Save Job

↓

Extension

↓

Extract Job Description

↓

Backend

↓

MongoDB

↓

Job Saved

↓

Success Response

---

# 6. Dashboard View

User

↓

React Dashboard

↓

GET Dashboard API

↓

Backend

↓

MongoDB

↓

Applications

↓

Jobs

↓

Resumes

↓

Statistics

↓

Backend

↓

Dashboard

↓

Render UI

---

# 7. AI Question Answer Generation

Application Form

↓

Extension extracts all questions

↓

Backend

↓

AI Service

↓

Generate answers

↓

Backend

↓

Extension

↓

Preview Answers

↓

User Edits (Optional)

↓

Fill Form

---

# 8. Authentication Flow

User Login

↓

Dashboard / Extension

↓

Backend

↓

Verify Credentials

↓

Generate Access Token

↓

Generate Refresh Token

↓

Store Refresh Token

↓

Return Tokens

↓

Authenticated User

---

# Design Principles

- Backend is the single source of truth.
- Frontend and Extension never communicate directly with AI.
- All AI requests pass through the AI Service Layer.
- Users always review AI-generated content before submission.
- Every component has a single responsibility.