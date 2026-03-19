# Task Manager App

A full-stack Task Manager application with user authentication and full CRUD task management.

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 19, Vite, Tailwind CSS, Axios     |
| Routing    | React Router DOM v7                     |
| Backend    | Node.js, Express 5                      |
| Database   | MongoDB, Mongoose                       |
| Auth       | JWT (jsonwebtoken), bcrypt              |

---

## Project Structure

```
task/
├── backend/
│   ├── middleware/       # JWT auth middleware
│   ├── models/           # Mongoose models (User, Task)
│   ├── routes/           # Express routes (auth, tasks)
│   ├── .env              # Environment variables
│   └── index.js          # Entry point
└── frontend/
    ├── src/
    │   ├── api/          # Axios API calls
    │   ├── components/   # Reusable components
    │   ├── context/      # Auth context (global state)
    │   └── pages/        # Login, Register, Dashboard, Tasks
    └── index.html
```

---

## Setup Instructions

### Prerequisites
- Node.js >= 18
- MongoDB running locally or a MongoDB Atlas URI

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_secret_key_here
PORT=3001
```

Start the backend server:

```bash
npm run dev
```

Server runs at: `http://localhost:3001`

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## API Endpoints

### Auth Routes — `/api/auth`

| Method | Endpoint            | Auth Required | Description              |
|--------|---------------------|---------------|--------------------------|
| POST   | `/api/auth/register`| No            | Register a new user      |
| POST   | `/api/auth/login`   | No            | Login and receive JWT    |
| GET    | `/api/auth/profile` | Yes           | Get logged-in user info  |

#### POST `/api/auth/register`
```json
// Request Body
{ "name": "John", "email": "john@example.com", "password": "secret123" }

// Response 201
{ "message": "User registered successfully", "userId": "<id>" }
```

#### POST `/api/auth/login`
```json
// Request Body
{ "email": "john@example.com", "password": "secret123" }

// Response 200
{ "token": "<jwt>", "user": { "id": "<id>", "name": "John", "email": "john@example.com" } }
```

---

### Task Routes — `/api/tasks`

> All task routes require `Authorization: Bearer <token>` header.

| Method | Endpoint                   | Description                        |
|--------|----------------------------|------------------------------------|
| GET    | `/api/tasks`               | Get all tasks (filter/sort/paginate)|
| POST   | `/api/tasks`               | Create a new task                  |
| PUT    | `/api/tasks/:id`           | Update a task                      |
| PATCH  | `/api/tasks/:id/complete`  | Mark task as Completed             |
| DELETE | `/api/tasks/:id`           | Delete a task                      |

#### GET `/api/tasks` — Query Parameters

| Param      | Type   | Description                          |
|------------|--------|--------------------------------------|
| `status`   | string | Filter by `Pending`, `In Progress`, `Completed` |
| `priority` | string | Filter by `Low`, `Medium`, `High`    |
| `search`   | string | Search by task title (case-insensitive) |
| `sortByDue`| string | Sort by due date: `asc` or `desc`    |
| `page`     | number | Page number (default: 1)             |
| `limit`    | number | Results per page (default: 10)       |

#### POST `/api/tasks`
```json
// Request Body
{
  "title": "Fix bug",
  "description": "Fix login bug",
  "status": "Pending",
  "priority": "High",
  "dueDate": "2025-08-01"
}
```

---

## Task Model

| Field       | Type     | Values                              | Default    |
|-------------|----------|-------------------------------------|------------|
| title       | String   | —                                   | required   |
| description | String   | —                                   | `""`       |
| status      | String   | `Pending`, `In Progress`, `Completed` | `Pending` |
| priority    | String   | `Low`, `Medium`, `High`             | `Medium`   |
| dueDate     | Date     | —                                   | —          |
| createdBy   | ObjectId | ref: User                           | required   |

---

## Features

- User registration and login with JWT authentication
- Protected routes on both frontend and backend
- Each user's tasks are stored in MongoDB linked to their account
- Dashboard shows the 5 most recent tasks automatically on every login
- Tasks persist across logouts — they are never deleted unless the user explicitly deletes them
- Create, edit, delete, and complete tasks
- Filter tasks by status and priority
- Search tasks by title
- Sort tasks by due date
- Pagination support

---

## How Task Persistence Works

- Every task is saved in MongoDB with a `createdBy` field referencing the logged-in user
- On login, the Dashboard automatically fetches that user's 5 most recent tasks from the database
- Logging out only clears the JWT token from the browser — tasks remain safely in the database
- On next login, the same tasks are fetched and displayed again automatically
