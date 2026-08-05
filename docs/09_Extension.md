# Chrome Extension Architecture

## Overview

The CareerOS Chrome Extension acts as an intelligent bridge between job portals and the CareerOS backend.

It helps users automate repetitive job application tasks while keeping them in complete control of every application.

The extension never communicates directly with AI providers or the database. All communication happens through the CareerOS backend.

---

# Responsibilities

The extension is responsible for:

- Detecting supported job portals
- Extracting Job Descriptions
- Detecting application forms
- Reading form fields
- Requesting AI-generated answers
- Autofilling application forms
- Uploading resumes (where supported)
- Saving jobs to CareerOS
- Opening the Dashboard when required

---

# High-Level Workflow

User opens a job application page

↓

CareerOS Extension detects supported website

↓

Extract Job Description

↓

Send Job Description to Backend

↓

Backend analyzes the Job Description

↓

AI generates recommendations

↓

Extension displays recommendations

↓

User reviews suggestions

↓

Extension fills the application form

---

# Supported Platforms (MVP)

- LinkedIn
- Greenhouse
- Lever
- Workday
- Company Career Pages

---

# Extension Components

## 1. Popup

Responsibilities

- Login
- Dashboard Shortcut
- Generate AI Answers
- Save Current Job
- Settings

---

## 2. Content Script

Responsibilities

- Read current webpage
- Detect forms
- Extract Job Description
- Fill inputs
- Fill textareas
- Trigger browser events

---

## 3. Background Service Worker

Responsibilities

- API communication
- Authentication
- Message passing
- Session management

---

## 4. Storage

Stores

- Access Token (temporary)
- Extension Preferences
- Cached User Data

Sensitive information is never permanently stored inside the extension.

---

# Communication Flow

Chrome Extension

↓

Backend REST API

↓

Business Logic

↓

AI Service

↓

Database

↓

Response

↓

Extension

---

# Form Autofill Workflow

Detect Form

↓

Read HTML Elements

↓

Identify Input Types

↓

Request User Data

↓

Request AI Answers (if needed)

↓

Fill Fields

↓

Dispatch Input Events

↓

User Reviews

↓

Submit

---

# AI-assisted Questions

For descriptive questions

Example

- Why do you want to join us?
- Tell us about yourself.
- Describe your experience.
- Cover Letter

The extension:

1. Extracts all questions.
2. Sends them to Backend.
3. Backend calls AI.
4. AI generates answers.
5. User reviews.
6. Extension fills answers.

---

# Security

- Never expose AI API Keys.
- Never communicate directly with AI providers.
- Validate all API responses.
- Use HTTPS for all communication.

---

# Future Features

- Multi-step form navigation
- Automatic field detection using AI
- AI interview preparation
- Resume optimization
- One-click application summary