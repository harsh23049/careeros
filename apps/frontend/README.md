# CareerOS — Frontend Application

AI-powered job application management platform frontend built with React, Vite, Tailwind CSS, React Router, and TanStack Query.

## Structure

```
src/
├── app/          # Router & Global Providers
├── assets/       # Static assets & icons
├── components/   # UI Primitives, Sidebar, Header, and Feature Components
├── features/     # Feature entry points (auth, jobs, applications, resumes, ai)
├── hooks/        # Custom React hooks (e.g. useDocumentTitle)
├── layouts/      # DashboardLayout and AuthLayout shells
├── pages/        # Route page views (Dashboard, Jobs, Details, Pipeline, AI, Auth)
├── services/     # Axios API services connected to backend endpoints
└── utils/        # Class utility (cn) and formatters
```

## Available Routes

- `/dashboard` — Main overview & pipeline metrics
- `/jobs` — Saved jobs and search listings
- `/jobs/:id` — Individual job details & AI match
- `/applications` — Kanban / stage pipeline tracker
- `/resumes` — Resume documents manager
- `/ai-tools` — AI analysis, matching, and cover letter generator
- `/settings` — Profile and preferences
- `/login` — User authentication
- `/register` — Account registration
- `/forgot-password` — Password reset request
- `/reset-password` — Password reset confirmation

## Development

```bash
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```
