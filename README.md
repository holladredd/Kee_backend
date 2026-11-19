# Kee Backend API

Backend REST API for **Kee** — the Android-first personal memory and task assistant.

## Features
- **Authentication**: JWT-based session management with bcrypt password hashing and rate limiting.
- **Relational Data Model**: Managed by Prisma ORM for PostgreSQL.
- **Entities**: User, Memory, Task, Reminder, Attachment, SyncLog.
- **Offline-First Synchronization**: Two-way push/pull sync engine with outbox, timestamps, and conflict resolution.
- **Strict Validation**: Zod schema validation across all endpoints.
- **Full-Text Search Ready**: Configured for PostgreSQL full-text search and compatible with pgvector.

---

## Setup & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `DATABASE_URL` with your PostgreSQL connection string:
```
DATABASE_URL="postgresql://user:password@localhost:5432/kee_db?schema=public"
JWT_SECRET="your-secure-jwt-secret"
```

### 3. Run Database Migrations
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Start Server
- Development mode (with live reload):
  ```bash
  npm run dev
  ```
- Production mode:
  ```bash
  npm start
  ```

---

## Testing
Run the automated test suite:
```bash
npm test
```

---

## REST Endpoints

### Health
- `GET /api/v1/health` - Server health status

### Auth
- `POST /api/v1/auth/register` - Create account `{ email, password }`
- `POST /api/v1/auth/login` - Authenticate `{ email, password }`
- `GET /api/v1/auth/profile` - Current user profile (Bearer token)

### Memories
- `POST /api/v1/memories` - Create memory
- `GET /api/v1/memories` - List memories (filter by `category`, `search`, `memoryType`)
- `GET /api/v1/memories/:id` - Get memory details
- `PATCH /api/v1/memories/:id` - Update memory
- `DELETE /api/v1/memories/:id` - Soft/Hard delete

### Tasks
- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks` - List tasks (filter by `status`)
- `PATCH /api/v1/tasks/:id` - Update task / mark complete
- `DELETE /api/v1/tasks/:id` - Delete task

### Reminders
- `POST /api/v1/reminders` - Create reminder
- `GET /api/v1/reminders` - List reminders
- `PATCH /api/v1/reminders/:id` - Reschedule / toggle reminder
- `DELETE /api/v1/reminders/:id` - Delete reminder

### Synchronization
- `POST /api/v1/sync` - Two-way push/pull synchronization
