# Habit Tracker API

A REST API for tracking personal habits and managing streaks, built with Node.js, TypeScript, Express, and PostgreSQL.

## Features

- User authentication with JWT
- Create, read, update, and delete habits
- Daily habit tracking
- 7-day history view
- Automatic streak calculation
- Tag-based filtering
- Pagination support
- Rate limiting (100 requests/hour)

## Tech Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT + bcrypt
- **Validation:** express-validator
- **Rate Limiting:** express-rate-limit

## Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- pnpm (or npm/yarn)

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd habit-tracker-api
```

2. Install dependencies

```bash
pnpm install
```

3. Configure environment variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/habit_tracker?schema=public"
JWT_SECRET="your-secret-key-here"
PORT=3000
```

4. Run database migrations

```bash
pnpm prisma:migrate
```

5. Generate Prisma Client

```bash
pnpm prisma:generate
```

### Running the Application

Development mode:

```bash
pnpm dev
```

Production build:

```bash
pnpm build
pnpm start
```

## API Documentation

### Authentication

All habit-related endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Auth

**POST /register**

Register a new user.

Request:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt-token"
  }
}
```

**POST /login**

Authenticate user and get JWT.

Request:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt-token"
  }
}
```

#### Habits

**POST /habits**

Create a new habit.

Request:
```json
{
  "title": "Morning Exercise",
  "description": "30 minutes of cardio",
  "frequency": "daily",
  "tags": ["health", "fitness"],
  "reminderTime": "07:00"
}
```

Response:
```json
{
  "success": true,
  "message": "Habit created successfully",
  "data": {
    "id": "uuid",
    "title": "Morning Exercise",
    "description": "30 minutes of cardio",
    "frequency": "daily",
    "tags": ["health", "fitness"],
    "reminderTime": "07:00",
    "userId": "uuid",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**GET /habits**

Get all habits for the authenticated user.

Query Parameters:
- `tag` (optional): Filter by tag
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page

Response:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "habits": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

**GET /habits/:id**

Get a specific habit.

Response:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "uuid",
    "title": "Morning Exercise",
    ...
  }
}
```

**PUT /habits/:id**

Update a habit.

Request (all fields optional):
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "frequency": "weekly",
  "tags": ["new-tag"],
  "reminderTime": "08:00"
}
```

Response:
```json
{
  "success": true,
  "message": "Habit updated successfully",
  "data": { ... }
}
```

**DELETE /habits/:id**

Delete a habit.

Response:
```json
{
  "success": true,
  "message": "Habit deleted successfully",
  "data": null
}
```

#### Tracking

**POST /habits/:id/track**

Mark habit as completed for today.

Response:
```json
{
  "success": true,
  "message": "Habit tracked successfully",
  "data": {
    "id": "uuid",
    "habitId": "uuid",
    "date": "2025-01-01",
    "completedAt": "2025-01-01T10:30:00.000Z"
  }
}
```

**GET /habits/:id/history**

Get last 7 days of tracking history and current streak.

Response:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "history": [
      {
        "date": "2025-01-01",
        "completed": true
      },
      {
        "date": "2025-01-02",
        "completed": false
      },
      ...
    ],
    "streak": 5
  }
}
```

### Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [...]
}
```

Common status codes:
- 400: Bad Request (validation errors)
- 401: Unauthorized (invalid/missing token)
- 404: Not Found
- 429: Too Many Requests (rate limit exceeded)
- 500: Internal Server Error

## Database Schema

### User
- id (UUID)
- name
- email (unique)
- password (hashed)
- createdAt
- updatedAt

### Habit
- id (UUID)
- title
- description
- frequency (daily/weekly)
- tags (array)
- reminderTime
- userId (foreign key)
- createdAt
- updatedAt

### HabitLog
- id (UUID)
- habitId (foreign key)
- date (unique per habit)
- completedAt
- Unique constraint: (habitId, date)

## Development Tools

### Prisma Studio

View and edit your database:

```bash
pnpm prisma:studio
```

### Rate Limiting

The API is rate-limited to 100 requests per hour per IP address.

## License

ISC
