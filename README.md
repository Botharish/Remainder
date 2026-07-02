# Remindly — Reminder Management SaaS

A production-shaped, full-stack reminder manager built with **Next.js 15 (App
Router)**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, **Better Auth**, and
**Convex**.

## Features

- **Auth** — email/password + Google via Better Auth, with a **Pending → Approved
  / Rejected** account lifecycle. Only approved users reach the app.
- **Dashboard** — total projects, upcoming/completed/overdue reminders, a 7-day
  activity chart, and a recent-activity feed.
- **Projects** — create / edit / delete / search; each project owns many
  reminders.
- **Reminders** — date + time scheduling, mark complete, and **live in-app
  notifications** when a reminder comes due (reactive Convex query + toast).
- **Logs** — every meaningful action is recorded (login, project/reminder CRUD,
  completions, approvals).
- **Admin Panel** — view all users, approve/reject, promote/demote admins, and
  browse system-wide logs.
- **UI** — modern dark theme, responsive, collapsible sidebar, skeletons, toasts.

## Architecture

```
convex/                     # Backend (Convex)
  schema.ts                 # users, projects, reminders, logs
  auth.ts / http.ts         # Better Auth server (runs inside Convex)
  users.ts projects.ts …    # queries / mutations, grouped by feature
  model/                    # shared authz + logging helpers
src/
  app/(auth)/               # login, signup
  app/(dashboard)/          # dashboard, projects, logs, settings, admin
  components/               # ui/ (shadcn) + feature folders
  hooks/ lib/               # notifications hook, auth client, helpers
  middleware.ts             # optimistic route protection
```

Authorization is enforced **server-side in Convex** (`requireApprovedUser`,
`requireAdmin`); the client guard and middleware are UX conveniences only.

## Getting started

### 1. Install

```bash
npm install
```

### 2. Provision Convex + Better Auth

Because Better Auth runs inside Convex via `@convex-dev/better-auth`, run the
component's initializer once, then start Convex:

```bash
npx convex dev
```

This creates a deployment, writes `CONVEX_DEPLOYMENT` and
`NEXT_PUBLIC_CONVEX_URL` to `.env.local`, and generates `convex/_generated/*`
(required for the app to type-check and build).

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Where |
| --- | --- |
| `NEXT_PUBLIC_CONVEX_URL` | set by `convex dev` |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | same host, `.convex.site` |
| `BETTER_AUTH_SECRET` | `npx @better-auth/cli secret` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud Console |
| `ADMIN_EMAIL` | first sign-up with this email becomes admin + approved |

Set the server-side vars on the Convex deployment too:

```bash
npx convex env set SITE_URL http://localhost:3000
npx convex env set BETTER_AUTH_SECRET <secret>
npx convex env set ADMIN_EMAIL admin@example.com
npx convex env set GOOGLE_CLIENT_ID <id>
npx convex env set GOOGLE_CLIENT_SECRET <secret>
```

### 4. Run

```bash
npm run dev          # Next.js
npx convex dev       # Convex (separate terminal)
```

Sign up with your `ADMIN_EMAIL` to get an approved admin account, then approve
other users from the **Admin Panel**.

## Deployment

- **Convex Cloud** — `npx convex deploy`, and set the same env vars for prod.
- **Vercel** — import the repo; add the `NEXT_PUBLIC_*`, `BETTER_AUTH_*`, and
  Google env vars. Set the Google OAuth redirect URI to
  `{SITE_URL}/api/auth/callback/google`.

> **Note:** `convex/_generated/` is created by `convex dev`/`codegen`. Type
> errors referencing `@convex/_generated/*` before that step are expected and
> resolve once codegen has run.
