# TaskFlow — Task Manager App

> A full-stack task management application built for the INDPRO Internship Assignment.

![TaskFlow](https://img.shields.io/badge/Status-Complete-10b981?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)

---

## Live Demo

- **Frontend**: [https://taskflow-app.vercel.app](https://taskflow-app.vercel.app) *(deploy to update)*
- **Backend**: [https://taskflow-api.railway.app](https://taskflow-api.railway.app) *(deploy to update)*

---

## Features

- **Authentication** — Register & Login with JWT. Passwords hashed with bcrypt. Protected routes both on frontend and backend.
- **Kanban Board** — Three stages: **Todo**, **In Progress**, **Done** with color-coded columns.
- **Drag & Drop** — Move tasks between stages by dragging cards (powered by `@dnd-kit`).
- **Task Management** — Create, edit, delete tasks with title, description, priority (Low/Medium/High), and due date.
- **Search** — Live client-side search/filter across task title and description.
- **Progress Bar** — Visual overview of task completion across all stages.
- **Responsive Design** — Works across desktop, tablet, and mobile.
- **Loading & Error States** — Full handling with toast notifications.
- **Overdue Detection** — Tasks past their due date are highlighted in red.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, React Router v6, @dnd-kit, Axios, Lucide Icons, react-hot-toast |
| Styling | Vanilla CSS with CSS custom properties (design tokens), glassmorphism |
| Backend | Node.js + Express 5, express-validator |
| Database | MongoDB Atlas via Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Deployment | Vercel (frontend) + Railway (backend) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)

### 1. Clone and install

```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow

# Install backend
cd server && npm install

# Install frontend
cd ../client && npm install
```

### 2. Backend setup

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/taskmanager
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 3. Frontend setup

`client/.env` is already configured for local development:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run locally

```bash
# Terminal 1 — Backend
cd server && npm start

# Terminal 2 — Frontend
cd client && npm run dev
```

Visit `http://localhost:5173`

---

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Sign in, returns JWT |
| GET | `/api/tasks` | Yes | Get all user tasks |
| POST | `/api/tasks` | Yes | Create task |
| PATCH | `/api/tasks/:id` | Yes | Update task |
| DELETE | `/api/tasks/:id` | Yes | Delete task |

---

## Project Structure

```
taskflow/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── api/               # Axios instance + API helpers
│   │   │   ├── axios.js       # Configured axios with interceptors
│   │   │   └── index.js       # Auth + tasks API functions
│   │   ├── components/
│   │   │   ├── Navbar.jsx     # Sticky top nav with user info
│   │   │   ├── KanbanColumn.jsx  # Droppable stage column
│   │   │   ├── TaskCard.jsx   # Draggable task card
│   │   │   └── TaskModal.jsx  # Create/edit modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Auth state + localStorage sync
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── DashboardPage.jsx
│   │   ├── App.jsx            # Routes with auth guards
│   │   └── main.jsx
│   └── vite.config.js
│
└── server/                    # Express backend
    ├── models/
    │   ├── User.js            # Mongoose user schema
    │   └── Task.js            # Mongoose task schema
    ├── routes/
    │   ├── auth.js            # /api/auth/* routes
    │   └── tasks.js           # /api/tasks/* routes (protected)
    ├── middleware/
    │   └── auth.js            # JWT verification middleware
    └── index.js               # Server entry point
```

---

## Assumptions & Tradeoffs

### Assumptions
- A user's tasks are **private** — users can only see and manage their own tasks.
- Task ordering within a column is not persisted to the database (order resets on reload). Persisting sort order would require an `order` field and a reorder endpoint, which was out of scope for this assignment.
- "In Progress" is stored as `inprogress` internally (no spaces) for simplicity.

### Tradeoffs
- **JWT in localStorage vs. HttpOnly cookies**: Stored in localStorage for simplicity. In a production app, HttpOnly cookies would be preferred to mitigate XSS risks. This is a known and accepted tradeoff for this scope.
- **Client-side search**: Search is done on the already-loaded tasks rather than making an API call. This works well for a personal task manager with a reasonable number of tasks. For a multi-user enterprise app, server-side search with debounce would be more appropriate.
- **Optimistic UI for delete**: Tasks are removed from the UI immediately and the API call happens in the background. If the API call fails, we reload tasks and show an error. This makes the UI feel snappy.
- **No refresh token**: JWT expires in 7 days. A production app would implement refresh tokens to avoid forcing users to re-login.

### Technical Decisions
- **@dnd-kit** over `react-beautiful-dnd`: dnd-kit is more actively maintained and has better accessibility support.
- **Vanilla CSS with custom properties** over a utility framework: Gives full control over the design and keeps the bundle lean.
- **Express-validator** for input validation on the backend in addition to frontend validation — defense in depth.
- **Mongoose indexes** on `{ user, stage }` for efficient per-stage queries.

---

## Deployment Guide

### Frontend (Vercel)
```bash
cd client
# Set environment variable in Vercel dashboard:
# VITE_API_URL = https://your-backend.railway.app/api
vercel --prod
```

### Backend (Railway)
```bash
cd server
# Add environment variables in Railway dashboard:
# MONGODB_URI, JWT_SECRET, CLIENT_URL, PORT
# Railway auto-detects Node.js and runs npm start
railway up
```

---

## AI Tools Disclosure

This project was developed with AI assistance (Gemini). Per the assignment rules, the backend is therefore **mandatory** and has been fully implemented with database integration and JWT authentication.
