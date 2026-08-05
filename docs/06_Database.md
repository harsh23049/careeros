# CareerOS Database Design

## Overview

CareerOS uses MongoDB as its primary database.

The database stores user information, resumes, job descriptions, AI-generated documents, and application history.

---

# Collections

## 1. Users

Stores user profile information.

Fields

- _id
- fullName
- email
- phone
- password (Future)
- profileImage
- createdAt
- updatedAt

---

## 2. Resumes

Stores multiple resumes uploaded by users.

Fields

- _id
- userId
- title
- category
- skills
- fileUrl
- fileType
- version
- createdAt
- updatedAt

Example

Backend Resume

AI Resume

Full Stack Resume

---

## 3. Jobs

Stores saved job descriptions.

Fields

- _id
- userId
- company
- jobTitle
- location
- jobType
- experience
- salary
- jobDescription
- requiredSkills
- sourceWebsite
- jobUrl
- createdAt

---

## 4. Applications

Tracks every application.

Fields

- _id
- userId
- jobId
- resumeId
- status
- appliedDate
- notes

Status

- Saved
- Applied
- Interview
- OA
- Rejected
- Offer

---

## 5. GeneratedDocuments

Stores AI-generated content.

Fields

- _id
- userId
- jobId
- type
- content
- createdAt

Types

- Cover Letter
- Cold Email
- HR Answers

---

## 6. AIHistory

Stores AI requests.

Fields

- _id
- userId
- prompt
- response
- createdAt

Purpose

- Debugging
- Analytics
- Future Improvements

---

## Relationships

User

↓

Multiple Resumes

↓

Multiple Jobs

↓

Multiple Applications

↓

Multiple AI Documents

---

# ER Diagram

User

│

├─────────────── Resume

│

├─────────────── Job

│                    │

│                    ▼

│              Application

│

└─────────────── Generated Document

---

# Future Collections

- Notifications
- Interview Preparation
- Calendar Events
- Referral Tracking
- ATS Reports

---

# Design Principles

- Keep collections independent.
- Avoid duplicate data.
- Reference documents using ObjectIds.
- Store files in Cloudinary and only save URLs in MongoDB.