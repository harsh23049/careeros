# CareerOS Architecture

## High-Level Architecture

CareerOS follows a modular client-server architecture.

```
                    +--------------------+
                    |   React Dashboard  |
                    +--------------------+
                              |
                              |
                    REST API (Axios)
                              |
                              |
+--------------------+        |
| Chrome Extension   |--------+
+--------------------+
                              |
                              ▼
                   +----------------------+
                   | Express.js Backend   |
                   +----------------------+
                              |
        +---------------------+----------------------+
        |                     |                      |
        ▼                     ▼                      ▼
 AI Service Layer      Business Logic          Authentication
        |                     |                      |
        +---------------------+----------------------+
                              |
                              ▼
                        MongoDB Database
                              |
                              ▼
                         Cloudinary Storage
```

---

# Components

## 1. React Dashboard

Responsibilities

- Resume Management
- Application Tracking
- AI Document Generation
- Analytics
- User Settings

---

## 2. Chrome Extension

Responsibilities

- Detect Job Pages
- Extract Job Description
- Autofill Forms
- Upload Resume
- Save Jobs

---

## 3. Backend

Acts as the central controller of CareerOS.

Responsibilities

- API Management
- Authentication
- Business Logic
- AI Communication
- Database Communication
- File Uploads

---

## 4. Database

Stores

- Users
- Resumes
- Jobs
- Applications
- AI History
- Settings

---

## 5. AI Layer

Responsible for

- Resume Recommendation
- Job Description Analysis
- Cover Letter Generation
- Recruiter Email Generation
- HR Answer Generation

---

# Communication Flow

Dashboard

↓

Backend

↓

AI / Database

↓

Backend

↓

Dashboard

The Chrome Extension follows the same communication flow.

---

# Architectural Principles

- Modular Design
- Separation of Concerns
- Reusable Services
- Secure API Communication
- Scalable Folder Structure
- Single Source of Truth (Backend)

---

# Future Scalability

Future services can include

- Notification Service
- Recommendation Service
- Analytics Service
- Interview Service
- ATS Service