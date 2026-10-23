# DoctorTrack

DoctorTrack is a secure admin workspace for organizing a clinic's doctors and patient records, with searchable directories, doctor-to-patient relationships, and a concise view of practice activity. It is designed to keep routine care administration clear and responsive while keeping database access on the backend.

This repository contains the **Next.js frontend only**. The standalone API is maintained in the [doctor-tracker-backend repository](https://github.com/jarir2020/doctor-tracker-backend).

## Project links

- Frontend repository: [doctor-tracker-frontend](https://github.com/jarir2020/doctor-tracker-frontend)
- Backend repository: [doctor-tracker-backend](https://github.com/jarir2020/doctor-tracker-backend)
- Live frontend: Pending deployment
- Live backend API: Pending deployment

## Features

- Admin sign-in with a protected portal.
- Dashboard totals, six-month activity, and patient counts by doctor.
- Doctor directory with doctor creation, search, specialization/date filters, and pagination.
- Doctor profile with linked patient list, patient creation, search, date filters, and pagination.
- Patient directory with search, condition/date filters, pagination, editing, and deletion.
- Responsive layouts for desktop and mobile.

## System architecture and data flow

```text
Browser (same-origin /api) --> Next.js URL rewrite --> Express REST API --Mongoose--> MongoDB Atlas
```

The browser uses the same-origin `/api` path. A Next.js external rewrite forwards those requests to the standalone Express API, so the browser session cookie remains first-party. Set `BACKEND_API_ORIGIN` for the rewrite target and `NEXT_PUBLIC_API_BASE_URL=/api` for the browser client. The Express server authenticates administrators, validates requests, applies filters and pagination, and performs dashboard aggregations. Patient documents reference a doctor. The browser never connects directly to MongoDB.

The frontend and backend are separate applications and separate GitHub repositories. The frontend is deployed to Vercel; the API is deployed as a Render Web Service; MongoDB Atlas stores the demo data.

## Local setup

Requirements: Node.js 22 or newer, npm, and a running MongoDB instance or MongoDB Atlas URI.

1. Clone this frontend repository and the [backend repository](https://github.com/jarir2020/doctor-tracker-backend) into sibling folders.
2. In `backend/`, copy `.env.example` to `.env`; set `MONGODB_URI`, `SESSION_SECRET`, `ADMIN_EMAIL`, and an `ADMIN_PASSWORD` with at least 12 characters. Follow the backend README to install packages and seed the administrator.
3. In this repository, copy `.env.example` to `.env.local`; the local rewrite target points to the Express API on port 4000:

   ```env
NEXT_PUBLIC_API_BASE_URL=/api
BACKEND_API_ORIGIN=http://localhost:4000
   ```

4. Install and run the frontend:

   ```bash
   npm install
   npm run dev
   ```

5. Open `http://localhost:3000` and sign in with the administrator credentials configured in the backend environment.

The API needs the frontend origin in `FRONTEND_ORIGINS` (default: `http://localhost:3000`). Keep actual `.env` files and credentials out of Git.

## Technical decisions

### 1. Keep the frontend and API in separate repositories

The assignment requires a separate Next.js client and standalone Express server. Keeping separate repositories gives each application its own dependencies, history, deployment, and environment configuration. The REST boundary also keeps MongoDB credentials and database queries on the server.

### 2. Use server-managed admin sessions

The API stores the session on the server in MongoDB and sends the browser an `HttpOnly`, `Secure` session cookie. This avoids keeping an API token in JavaScript-readable browser storage and lets logout invalidate the server-side session. A same-origin `/api` rewrite forwards requests to Express, avoiding third-party-cookie dependence while the backend still checks the allowed frontend origin.

## Screenshots

Screenshots below show the responsive UI with synthetic sample records from a local preview. No real patient information is included.

| Desktop | Mobile |
|---|---|
| <img src="docs/screenshots/desktop-dashboard.png" alt="DoctorTrack dashboard on desktop" width="680"> | <img src="docs/screenshots/mobile-dashboard.png" alt="DoctorTrack dashboard on mobile" width="240"> |

## Deployment

1. Deploy the backend repository to Render from its `render.yaml` Blueprint. Set its Atlas connection and demo administrator environment values, then obtain the Render service origin.
2. Import this repository into Vercel as a Next.js project, using the repository root as the project root and `main` as the production branch. Git-connected Vercel projects can deploy production from the production branch and preview deployments from other branches ([Vercel Git deployments](https://vercel.com/docs/git)).
3. Set these Vercel environment variables for Production, then redeploy:

   ```env
   NEXT_PUBLIC_API_BASE_URL=/api
   BACKEND_API_ORIGIN=https://<your-render-service>.onrender.com
   ```

4. Copy the assigned Vercel production origin (for example, `https://<your-project>.vercel.app`) into the Render `FRONTEND_ORIGINS` setting, without a trailing slash, and redeploy the API. The Next.js rewrite keeps browser requests on the frontend origin while forwarding them to the API.
5. Check `https://<your-render-service>.onrender.com/api/health`, then sign in and verify the doctor and patient workflows through the deployed frontend.

### Submission links

- Frontend GitHub repository: https://github.com/jarir2020/doctor-tracker-frontend
- Backend GitHub repository: https://github.com/jarir2020/doctor-tracker-backend
- Live frontend website: **Pending deployment**
- Live backend API: **Pending deployment**

For evaluation, use synthetic patient records only. Do not add secrets or real patient information to either repository.
