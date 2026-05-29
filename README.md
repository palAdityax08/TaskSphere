# TaskFlow — Task Manager App

> A full-stack task management application built for a Assignment.

![TaskFlow](https://img.shields.io/badge/Status-Complete-10b981?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)



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

