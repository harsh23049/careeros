# API Specification

## Overview

CareerOS follows RESTful API principles.

All clients (Dashboard and Chrome Extension) communicate with the backend through HTTP APIs.

Base URL

/api/v1

---

# Authentication APIs

## Login

POST /auth/login

Purpose

Authenticate user.

Request

{
    "email": "user@gmail.com",
    "password": "********"
}

Response

{
    "success": true,
    "token": "...",
    "user": { }
}

---

## Register

POST /auth/register

---

## Logout

POST /auth/logout

---

# Resume APIs

## Upload Resume

POST /resumes/upload

Purpose

Upload a new resume.

Request

FormData

- resume
- title
- category

Response

{
    "success": true,
    "resumeId": "...",
    "fileUrl": "..."
}

---

## Get All Resumes

GET /resumes

Response

[
   {
      "id":"...",
      "title":"Backend Resume"
   }
]

---

## Delete Resume

DELETE /resumes/:resumeId

---

## Update Resume

PUT /resumes/:resumeId

---

# Job APIs

## Save Job

POST /jobs

Purpose

Save a job description.

Request

{
   "company":"Google",
   "title":"SDE Intern",
   "description":"..."
}

Response

{
   "success":true
}

---

## Get Jobs

GET /jobs

---

## Get Single Job

GET /jobs/:jobId

---

## Delete Job

DELETE /jobs/:jobId

---

## Update Job Status

PATCH /jobs/:jobId/status

Request

{
    "status":"Interview"
}

Status Values

- Saved
- Applied
- OA
- Interview
- Rejected
- Offer

---

# AI APIs

## Analyze Job Description

POST /ai/analyze-jd

Purpose

Analyze Job Description.

Request

{
   "jobDescription":"..."
}

Response

{
   "summary":"...",
   "requiredSkills":[ ],
   "experience":"...",
   "jobType":"..."
}

---

## Recommend Resume

POST /ai/recommend-resume

Request

{
   "jobId":"...",
   "userId":"..."
}

Response

{
   "resumeId":"...",
   "score":95
}

---

## Generate Cover Letter

POST /ai/cover-letter

Request

{
   "jobId":"...",
   "resumeId":"..."
}

Response

{
   "coverLetter":"..."
}

---

## Generate Cold Email

POST /ai/cold-email

Request

{
   "jobId":"..."
}

Response

{
   "email":"..."
}

---

## Generate HR Answers

POST /ai/hr-answers

Purpose

Answer company-specific descriptive questions.

Request

{
   "jobId":"...",
   "questions":[
      "...",
      "...",
      "..."
   ]
}

Response

{
   "answers":[
      "...",
      "...",
      "..."
   ]
}

---

# Application APIs

## Apply

POST /applications

Purpose

Create application record.

---

## Get Applications

GET /applications

---

## Get Application

GET /applications/:applicationId

---

## Update Application

PATCH /applications/:applicationId

---

## Delete Application

DELETE /applications/:applicationId

---

# Dashboard APIs

## Dashboard Summary

GET /dashboard

Returns

{
   "totalJobs":0,
   "applied":0,
   "interviews":0,
   "offers":0
}

---

# Extension APIs

## Extract Job

POST /extension/extract

Purpose

Save extracted job from Chrome Extension.

---

## Autofill Form

POST /extension/autofill

Purpose

Return all user information required for filling forms.

Response

{
   "name":"...",
   "email":"...",
   "phone":"...",
   "resume":"..."
}

---

## Generate Form Answers

POST /extension/generate

Purpose

Generate answers for all descriptive questions present in a job application.

Request

{
   "jobId":"...",
   "questions":[ ]
}

Response

{
   "answers":[ ]
}

---

# Health Check

GET /health

Response

{
   "status":"Healthy"
}

---

# API Standards

## Response Format

Success

{
   "success": true,
   "data": {}
}

Failure

{
   "success": false,
   "message": "...",
   "error": {}
}

---

# HTTP Status Codes

200 OK

201 Created

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

500 Internal Server Error

---

# Versioning

Current Version

v1

Base URL

/api/v1