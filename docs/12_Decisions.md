# Architecture Decision Records (ADR)

This document records important architectural decisions made during the development of CareerOS.

Each decision includes the reason behind it.

---

# ADR-001

Decision

CareerOS will follow a Monorepo architecture.

Reason

- Easier code sharing
- Single repository
- Simplified version control
- Better project organization

---

# ADR-002

Decision

Backend will be the Single Source of Truth.

Reason

Dashboard and Chrome Extension should never communicate directly with the database or AI services.

---

# ADR-003

Decision

AI API calls will always go through the backend.

Reason

- Protect API Keys
- Centralized Prompt Management
- Easier Model Switching
- Better Logging
- Rate Limiting

---

# ADR-004

Decision

MongoDB will be used as the primary database.

Reason

- Flexible document model
- Rapid development
- Well suited for evolving schemas

---

# ADR-005

Decision

Cloudinary will store uploaded files.

Reason

- Secure file storage
- CDN support
- Reduces database size

---

# ADR-006

Decision

CareerOS will use JWT Authentication.

Reason

- Stateless Authentication
- Scalable
- Industry Standard

Access Tokens

- Short-lived

Refresh Tokens

- Long-lived
- Stored in MongoDB

---

# ADR-007

Decision

The extension will never submit applications automatically.

Reason

CareerOS is an assistant, not an autonomous bot.

Users always approve AI-generated content before submission.

---

# ADR-008

Decision

AI-generated content will always be editable.

Reason

Users should have the opportunity to review and modify AI responses before using them.

---

# ADR-009

Decision

Cloud files will not be stored inside MongoDB.

Reason

MongoDB stores only metadata.

Actual files remain in Cloudinary.

---

# ADR-010

Decision

Express.js will be used for backend development.

Reason

- Lightweight
- Large ecosystem
- Excellent middleware support
- REST API development

---

# ADR-011

Decision

React will be used for the Dashboard.

Reason

- Component-based architecture
- Rich ecosystem
- Excellent developer experience

---

# ADR-012

Decision

Chrome Extension will be built using Manifest V3.

Reason

Latest Chrome standard with improved security and long-term support.

---

# ADR-013

Decision

Each major feature will be developed as an independent module.

Modules

- Resume
- Jobs
- Applications
- AI
- Dashboard
- Extension

Reason

Improves maintainability and scalability.

---

# ADR-014

Decision

All communication between frontend, extension, and backend will use REST APIs.

Reason

- Loose coupling
- Easier testing
- Better scalability
- Clear API contracts

---

# ADR-015

Decision

CareerOS will prioritize productivity over automation.

Reason

Every feature must save users time while ensuring they remain in complete control of the application process.

---

# Guiding Principles

- Simplicity over complexity.
- Security before convenience.
- AI assists; users decide.
- Build reusable modules.
- Design before implementation.
- Backend owns business logic.
- APIs define communication.