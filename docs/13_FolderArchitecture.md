# Folder Architecture

## Overview

CareerOS follows a modular monorepo architecture.

Each application has a single responsibility while sharing reusable components through common packages.

```
CareerOS
│
├── .github/
├── apps/
├── docs/
├── infra/
├── packages/
├── scripts/
├── README.md
├── LICENSE
├── .gitignore
└── docker-compose.yml
```

---

# Root Structure

## .github/

Purpose

Stores GitHub-specific configurations.

Contains

- GitHub Actions
- Issue Templates
- Pull Request Templates

---

## apps/

Contains all executable applications.

```
apps/
│
├── backend/
├── frontend/
└── extension/
```

---

## docs/

Contains project documentation.

Examples

- Product Vision
- Architecture
- Database Design
- API Specification

---

## infra/

Infrastructure configuration.

Examples

- Docker
- Nginx
- Deployment
- Environment Templates

---

## packages/

Reusable modules shared across applications.

```
packages/

shared/

ui/

prompts/
```

---

## scripts/

Automation scripts.

Examples

- Database Seeders
- Build Scripts
- Deployment Scripts

---

# Backend Architecture

```
backend/
│
├── src/
│
├── config/
├── controllers/
├── middlewares/
├── models/
├── repositories/
├── routes/
├── services/
├── validators/
├── utils/
├── app.js
└── server.js
```

---

## config/

Purpose

Application configuration.

Examples

- Database Connection
- Cloudinary
- JWT
- Environment Variables

---

## controllers/

Purpose

Receive HTTP requests.

Responsibilities

- Read Request
- Call Services
- Return Response

Controllers should never contain business logic.

---

## routes/

Purpose

Define API endpoints.

Example

```
POST /jobs

GET /jobs

DELETE /jobs/:id
```

Routes simply map requests to controllers.

---

## middlewares/

Purpose

Execute before controllers.

Examples

- Authentication
- Authorization
- Error Handling
- Request Logging

---

## models/

Purpose

MongoDB Schemas.

Each collection has one model.

Example

```
User

Resume

Job

Application
```

---

## repositories/

Purpose

Interact directly with MongoDB.

Responsibilities

- CRUD Operations
- Database Queries

Repositories should never contain business logic.

---

## services/

Purpose

Business Logic Layer.

This is the heart of CareerOS.

Example

```
services/

ai/

resume/

jobs/

applications/

email/
```

Responsibilities

- AI Calls
- Resume Selection
- Application Logic
- Business Rules

---

## validators/

Purpose

Validate user input.

Examples

- Email Validation
- Password Validation
- Resume Validation

---

## utils/

Purpose

Reusable helper functions.

Examples

- API Response Formatter
- Error Classes
- Logger
- Token Generator

---

## app.js

Purpose

Configure Express.

Contains

- Middleware
- Routes
- Error Handling

---

## server.js

Purpose

Application entry point.

Responsibilities

- Start Server
- Connect Database

---

# Frontend Architecture

```
frontend/
│
├── src/
│
├── assets/
├── components/
├── constants/
├── context/
├── hooks/
├── layouts/
├── pages/
├── routes/
├── services/
├── utils/
├── App.jsx
└── main.jsx
```

---

## assets/

Images

Icons

Fonts

---

## components/

Reusable UI Components.

Example

- Button
- Modal
- Navbar
- Sidebar

---

## pages/

Application Pages.

Examples

- Dashboard
- Login
- Jobs
- Resumes
- Settings

---

## layouts/

Page Layouts.

Example

Dashboard Layout

Authentication Layout

---

## hooks/

Reusable React Hooks.

Example

```
useAuth()

useJobs()

useResumes()
```

---

## services/

Communicates with Backend.

Example

```
jobService.js

resumeService.js

aiService.js
```

---

## context/

Global State Management.

Examples

- User
- Theme
- Authentication

---

## utils/

Frontend helper functions.

---

## routes/

React Router configuration.

---

# Chrome Extension Architecture

```
extension/
│
├── assets/
├── background/
├── content/
├── popup/
├── options/
├── services/
├── utils/
└── manifest.json
```

---

## background/

Background Service Worker.

Responsibilities

- API Calls
- Authentication
- Message Handling

---

## content/

Runs inside webpages.

Responsibilities

- Read DOM
- Detect Forms
- Fill Inputs
- Extract Job Description

---

## popup/

Extension UI.

Contains

- Login
- Generate
- Save Job
- Settings

---

## options/

Extension settings page.

---

## services/

Communicates with Backend.

---

## utils/

Shared helper functions.

---

# Shared Packages

## packages/shared/

Shared Types

Shared Constants

Shared Utilities

---

## packages/prompts/

AI Prompt Templates.

Examples

- Cover Letter
- Cold Email
- Resume Recommendation
- HR Questions

---

## packages/ui/

Reusable UI Components.

Used by

- Dashboard
- Future Applications

---

# Dependency Flow

```
Frontend

↓

Routes

↓

Controllers

↓

Services

↓

Repositories

↓

MongoDB
```

AI Flow

```
Frontend / Extension

↓

Backend

↓

AI Service

↓

Gemini API

↓

Backend

↓

Frontend / Extension
```

---

# Layer Responsibilities

## Route

Maps URL to Controller.

---

## Controller

Handles HTTP Request and Response.

---

## Service

Contains Business Logic.

---

## Repository

Communicates with Database.

---

## Model

Defines MongoDB Schema.

---

# Architecture Rules

- Controllers never access MongoDB directly.
- Services contain all business logic.
- Repositories only perform database operations.
- Routes never contain business logic.
- Models only define schemas.
- AI communication always happens through the AI Service Layer.
- Frontend and Extension communicate only through REST APIs.
- Backend remains the single source of truth.

---

# Design Philosophy

CareerOS follows the principle of Separation of Concerns.

Each layer has exactly one responsibility.

This architecture improves:

- Maintainability
- Scalability
- Testability
- Readability
- Reusability
- Team Collaboration

Future modules can be added without affecting existing components, allowing CareerOS to evolve into a production-scale AI-powered Career Management Platform.
