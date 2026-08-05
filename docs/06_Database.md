# Database Design

## Overview

CareerOS uses MongoDB as its primary database.

The database is designed around six core entities:

- Users
- Resumes
- Jobs
- Applications
- Generated Documents
- AI History

The backend follows a reference-based design using MongoDB ObjectIds to minimize data duplication and improve maintainability.

---

# Collection 1 : Users

## Purpose

Stores user profile information and authentication details.

---

### Fields

| Field | Type | Description |
|---------|------|-------------|
| _id | ObjectId | Unique User ID |
| fullName | String | User's Full Name |
| email | String | Unique Email Address |
| password | String | Hashed Password |
| phone | String | Contact Number |
| profileImage | String | Cloudinary Image URL |
| refreshToken | String | Active Refresh Token |
| createdAt | Date | Creation Timestamp |
| updatedAt | Date | Last Updated Timestamp |

---

## Notes

- Password will always be hashed using bcrypt.
- Only Refresh Token is stored.
- Access Tokens are never stored in MongoDB.
- Email must be unique.

---

# Collection 2 : Resumes

## Purpose

Stores multiple resumes uploaded by a user.

---

### Fields

| Field | Type | Description |
|---------|------|-------------|
| _id | ObjectId | Resume ID |
| userId | ObjectId | Reference to User |
| title | String | Resume Title |
| category | String | Backend / AI / Full Stack |
| skills | Array<String> | Resume Skills |
| fileUrl | String | Cloudinary File URL |
| fileType | String | PDF / DOCX |
| version | Number | Resume Version |
| isDefault | Boolean | Default Resume |
| createdAt | Date | Upload Time |
| updatedAt | Date | Last Updated |

---

## Example Categories

- Backend
- AI/ML
- Full Stack
- Java
- Python

---

# Collection 3 : Jobs

## Purpose

Stores every saved Job Description.

---

### Fields

| Field | Type | Description |
|---------|------|-------------|
| _id | ObjectId | Job ID |
| userId | ObjectId | Reference to User |
| company | String | Company Name |
| jobTitle | String | Job Title |
| location | String | Job Location |
| experience | String | Required Experience |
| employmentType | String | Internship / Full-Time |
| salary | String | Salary (Optional) |
| sourceWebsite | String | LinkedIn / Greenhouse / etc |
| jobUrl | String | Original Job Link |
| jobDescription | String | Complete JD |
| requiredSkills | Array<String> | Extracted Skills |
| createdAt | Date | Saved Time |
| updatedAt | Date | Last Updated |

---

# Collection 4 : Applications

## Purpose

Tracks every job application.

---

### Fields

| Field | Type | Description |
|---------|------|-------------|
| _id | ObjectId | Application ID |
| userId | ObjectId | Reference to User |
| jobId | ObjectId | Reference to Job |
| resumeId | ObjectId | Resume Used |
| generatedDocumentIds | Array<ObjectId> | AI Generated Documents |
| status | String | Application Status |
| appliedAt | Date | Apply Date |
| notes | String | Personal Notes |
| createdAt | Date | Creation Timestamp |
| updatedAt | Date | Last Updated |

---

## Status Values

- Saved
- Applied
- Online Assessment
- Interview
- Rejected
- Offer
- Accepted

---

# Collection 5 : GeneratedDocuments

## Purpose

Stores all AI-generated content.

---

### Fields

| Field | Type | Description |
|---------|------|-------------|
| _id | ObjectId | Document ID |
| userId | ObjectId | Reference to User |
| jobId | ObjectId | Reference to Job |
| applicationId | ObjectId | Reference to Application |
| type | String | Document Type |
| content | String | Generated Text |
| createdAt | Date | Generation Time |

---

## Supported Types

- Cover Letter
- Recruiter Email
- HR Answers
- Resume Summary
- Resume Recommendation

---

# Collection 6 : AIHistory

## Purpose

Stores metadata about every AI interaction.

This collection helps with:

- Debugging failed AI requests
- Tracking AI usage
- Monitoring token consumption
- Measuring response time
- Supporting future analytics
- Auditing AI-generated content

---

### Fields

| Field | Type | Description |
|---------|------|-------------|
| _id | ObjectId | History ID |
| userId | ObjectId | Reference to User |
| jobId | ObjectId | Related Job (Optional) |
| applicationId | ObjectId | Related Application (Optional) |
| feature | String | AI feature used |
| model | String | AI model name (Gemini, GPT, Claude, etc.) |
| prompt | String | Prompt sent to the model |
| response | String | Generated response |
| promptTokens | Number | Prompt token count |
| completionTokens | Number | Generated token count |
| totalTokens | Number | Total tokens consumed |
| responseTime | Number | Response time (milliseconds) |
| status | String | Success / Failed |
| errorMessage | String | Error details (if failed) |
| createdAt | Date | Request timestamp |

---

## Example Feature Values

- JD Analysis
- Resume Recommendation
- Cover Letter
- Cold Email
- HR Answers
- Resume Summary

---

## Example Status Values

- Success
- Failed
- Timeout

---

## Example Document

{
    "_id": "6891...",
    "userId": "688f...",
    "jobId": "6890...",
    "applicationId": "6892...",
    "feature": "Cover Letter",
    "model": "gemini-2.5-pro",
    "prompt": "Generate a cover letter...",
    "response": "Dear Hiring Manager...",
    "promptTokens": 432,
    "completionTokens": 287,
    "totalTokens": 719,
    "responseTime": 1840,
    "status": "Success",
    "errorMessage": null,
    "createdAt": "2026-08-05T12:30:00Z"
}
# Relationships

User (1)

├── (N) Resumes

├── (N) Jobs

├── (N) Applications

├── (N) GeneratedDocuments

└── (N) AIHistory

Application

├── (1) Job

├── (1) Resume

└── (N) GeneratedDocuments

---

# File Storage

MongoDB stores only metadata.

Actual files are stored in Cloudinary.

Stored Files

- Resume PDFs
- Profile Images

---

# Authentication

CareerOS uses JWT Authentication.

Login Flow

User Login

↓

Generate Access Token

↓

Generate Refresh Token

↓

Store Refresh Token in MongoDB

↓

Send Tokens to Client

---

## Token Storage

Access Token

- Short-lived
- Stored in HttpOnly Cookie
- Never stored in Database

Refresh Token

- Long-lived
- Stored in MongoDB
- Stored in HttpOnly Cookie

---

# Database Design Principles

- Use ObjectId references between collections.
- Avoid duplicate data.
- Store only file URLs in MongoDB.
- Keep collections independent.
- Design for scalability and future AI modules.
- Use timestamps for all collections.

---

# Future Collections

Future versions of CareerOS may include:

- Notifications
- Interview Sessions
- Calendar Events
- Job Recommendations
- Referral Tracking
- User Preferences
- Activity Logs