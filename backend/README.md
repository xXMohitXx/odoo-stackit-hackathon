# StackIt API

A RESTful API backend for StackIt, a community Q&A platform similar to Stack Overflow.

## Features

- Authentication & User Management
- Questions with tags
- Answers with voting system
- Notifications
- Admin moderation

## Tech Stack

- Node.js
- Express.js
- MongoDB
- JWT Authentication

## API Endpoints

### Authentication & User Management

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile (auth required)
- `GET /api/users/:id` - Get user profile (public)
- `PUT /api/users/profile` - Update user profile (auth required)

### Questions

- `GET /api/questions` - List questions with filters (newest, unanswered, by tag)
- `POST /api/questions` - Create a question (auth required)
- `GET /api/questions/:id` - Get question details with answers
- `DELETE /api/questions/:id` - Delete a question (owner or admin only)
- `POST /api/questions/:id/answers` - Add an answer to a question (auth required)

### Answers

- `PUT /api/answers/:id/accept` - Accept an answer (question owner only)
- `DELETE /api/answers/:id` - Delete an answer (owner or admin only)

### Voting

- `POST /api/answers/:id/vote` - Vote on an answer (auth required)
- `GET /api/answers/:id/votes` - Get vote counts for an answer

### Tags

- `GET /api/tags` - List all tags
- `GET /api/tags/:slug/questions` - Get questions by tag

### Notifications

- `GET /api/notifications` - Get user's notifications (auth required)
- `PUT /api/notifications/:id/read` - Mark notification as read (auth required)
- `PUT /api/notifications/read-all` - Mark all notifications as read (auth required)

### Admin

- `GET /api/admin/users` - Get all users (admin only)
- `DELETE /api/admin/questions/:id` - Delete a question (admin only)
- `DELETE /api/admin/answers/:id` - Delete an answer (admin only)
- `PUT /api/admin/ban/:userId` - Ban a user (admin only)
- `PUT /api/admin/unban/:userId` - Unban a user (admin only)

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository
2. Install dependencies
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/stackit
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   ```
4. Start the server
   ```
   npm run dev
   ```

## Mobile Compatibility

The API is designed to be consumed by both web and mobile clients. All endpoints return JSON data that can be easily parsed by any client application.

## License

MIT