# Minds Matter

Minds Matter is a full-stack mental health support platform built with React, Vite, Tailwind CSS, Node.js, Express, and MongoDB. It provides role-based authentication, a personalized dashboard, a searchable resource library, community discussion tools, support messaging, volunteer bookings, mood tracking, notifications, an emergency help panel, and an admin moderation workspace.

## Tech Stack

- Frontend: React + Vite + Tailwind CSS + React Query
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Auth: JWT + bcrypt password hashing
- Media storage: local filesystem abstraction with cloud-ready service boundary

## Features

- JWT signup, login, logout, and role-based authorization for users, volunteers, and admins
- Personalized dashboard with activity snapshots, bookmarks, recommendations, and mood graph
- Resource library for ebooks and audio sessions with search, filters, bookmarks, PDF/audio viewing, and progress tracking
- Community forum with posts, comments, likes, anonymous posting, and reporting
- Support area with user-to-user messaging, volunteer help requests, session booking, AI support helper, and emergency contacts
- Notifications center for new messages and booking updates
- Admin panel for user blocking, moderation overview, and resource uploads
- Responsive, calming UI with dark mode, reusable components, loading states, and accessible form controls

## Project Structure

```text
Minds Matter/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── data/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seeds/
│   │   ├── services/
│   │   └── utils/
│   └── uploads/
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── layouts/
│       ├── pages/
│       ├── services/
│       └── utils/
└── README.md
```

## MongoDB Schema Design

### `User`
- `name`, `email`, `password`
- `role`: `user | volunteer | admin`
- `avatarUrl`, `bio`, `expertise`
- `blocked`
- `bookmarks[]`
- `progress[]`

### `Resource`
- `title`, `description`, `category`, `type`
- `author`, `coverImage`, `fileUrl`
- `durationMinutes`, `featured`, `uploadedBy`, `tags[]`

### `ForumPost`
- `author`, `title`, `content`, `category`
- `anonymous`, `likes[]`, `flagged`

### `Comment`
- `post`, `author`, `content`
- `parentComment`, `likes[]`

### `Conversation`
- `participants[]`
- `type`: `direct | support`
- `requestedVolunteer`, `latestMessage`

### `Message`
- `conversation`, `sender`, `content`, `readBy[]`

### `Booking`
- `requester`, `volunteer`, `topic`, `notes`
- `scheduledFor`, `status`

### `MoodEntry`
- `user`, `mood`, `note`, `loggedAt`

### `Notification`
- `user`, `title`, `body`, `type`, `read`, `link`

### `Report`
- `reporter`, `targetType`, `targetId`, `reason`, `resolved`

## API Routes

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Dashboard and meta
- `GET /api/dashboard`
- `GET /api/meta`
- `GET /api/emergency`
- `POST /api/ai/support`

### Resources
- `GET /api/resources`
- `POST /api/resources`
- `PATCH /api/resources/:id/bookmark`
- `PATCH /api/resources/:id/progress`

### Community
- `GET /api/forum/posts`
- `POST /api/forum/posts`
- `PATCH /api/forum/posts/:id/like`
- `POST /api/forum/posts/:id/comments`
- `POST /api/forum/reports`

### Messaging and support
- `GET /api/conversations`
- `POST /api/conversations`
- `GET /api/conversations/:id/messages`
- `POST /api/conversations/:id/messages`
- `GET /api/volunteers`

### Bookings
- `GET /api/bookings`
- `POST /api/bookings`
- `PATCH /api/bookings/:id`

### Mood tracker
- `GET /api/moods`
- `POST /api/moods`

### Notifications
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`

### Admin
- `GET /api/admin/overview`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/block`

## Local Setup

### 1. Clone and install

```bash
cd "Minds Matter"
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

Copy the example files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Update `backend/.env` with your MongoDB connection string and JWT secret.

### 3. Seed sample data

```bash
cd backend
npm run seed
```

Seeded demo accounts:

- Admin: `ava@example.com` / `Password123!`
- Volunteer: `noah@example.com` / `Password123!`
- User: `mia@example.com` / `Password123!`

### 4. Run the apps

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

## Deployment

### Frontend on Vercel

1. Import the `frontend` folder as a Vercel project.
2. Set `VITE_API_URL` to your deployed backend URL plus `/api`.
3. Build command: `npm run build`
4. Output directory: `dist`

### Backend on Render

1. Create a new Web Service using the `backend` folder.
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables from `backend/.env.example`
5. Add a managed MongoDB database or connect to MongoDB Atlas
6. Set `CLIENT_URL` to the Vercel frontend domain

## Notes

- The app uses API-driven chat and notifications in v1, with data models designed so Socket.io can be added later.
- Uploaded files are stored locally under `backend/uploads` in this version.
- The AI helper is intentionally basic and rule-based. It is not a replacement for professional or crisis care.
