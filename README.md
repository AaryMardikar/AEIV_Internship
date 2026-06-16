# Outlook Workflow Hub 🏢

> Enterprise Productivity Platform — React + TypeScript + Node.js + PostgreSQL

This repository contains the Outlook Workflow Hub, a modern enterprise productivity platform featuring email-to-task parsing, automated workflows, document versioning, approval queues, meetings and action items, unified search, and audit logs.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite |
| **UI Framework** | Material UI v5 |
| **State Management** | React Query v5 |
| **HTTP Client** | Axios (with token refresh queues & error boundaries) |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL |
| **Auth** | JWT (access + refresh tokens) |
| **Logging** | Winston + Morgan |

---

## Quick Start & Running Locally

### 1. Prerequisites
Ensure you have the following installed on your system:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** database server (v14 or higher)

---

### 2. Database Server Setup
Make sure your PostgreSQL server is running. 

If you are using Windows, you can install and run PostgreSQL via the official installer, or via `winget`:
```bash
winget install PostgreSQL.PostgreSQL.16 --accept-source-agreements --accept-package-agreements
```

Start the PostgreSQL service (if not auto-started) and create a database named `outlook_workflow_hub`.
Using `psql`:
```sql
CREATE DATABASE outlook_workflow_hub;
```

---

### 3. Environment Variables Config

Create a `.env` file in the `backend` and `frontend` folders by copying the `.env.example` templates:

#### Backend (`backend/.env`):
```ini
NODE_ENV=development
PORT=5000
API_VERSION=v1

DB_HOST=localhost
DB_PORT=5432
DB_NAME=outlook_workflow_hub
DB_USER=postgres
DB_PASSWORD=postgres # Update with your Postgres password

JWT_SECRET=your_jwt_access_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### Frontend (`frontend/.env`):
```ini
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Outlook Workflow Hub
VITE_ENABLE_DEVTOOLS=true
```

---

### 4. Installation & Database Migration

Navigate to each folder to install dependencies and run migrations:

```bash
# Install backend dependencies and run migrations
cd backend
npm install
npm run db:migrate

# Install frontend dependencies
cd ../frontend
npm install
```

---

### 5. Running the Application

Start the backend and frontend development servers:

#### Start Backend API
```bash
cd backend
npm run dev
```

#### Start Frontend UI
```bash
cd frontend
npm run dev
```

Open your browser and navigate to **`http://localhost:5173`** (or the URL shown in your Vite terminal).

---

### 6. Default Login Credentials
Upon running the database migrations, a default admin account is automatically seeded into the database:

- **Username / Email**: `admin@owh.com`
- **Password**: `Admin@123`
- **Role**: `admin`

---

## Refactored Production Architecture Highlights

- **Backend Validation Layer**: Uses express-validator to enforce schema structures for all requests (e.g. Tasks, Approvals, Documents, Search, Audits).
- **Centralized Error Boundaries**: A global wrapper on the frontend that intercepts rendering exceptions to display a custom styled diagnostics UI instead of page crashes.
- **centralized Toast System**: Exposes a `useToast` hook rendering Material UI Snackbar notifications for operational alerts across all modules.
- **Secure Token Refresh**: Auto-intercepts expired tokens and securely regenerates them on-the-fly without interrupting the user session.
