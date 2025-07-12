# StackIt API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All responses follow a standard format:

### Success Response

```json
{
  "success": true,
  "data": { ... },  // The requested data
  "count": 10,      // For array responses
  "pagination": { ... }  // For paginated responses
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message"
}
```

## Endpoints

### Authentication

#### Register a new user

```
POST /auth/register
```

Request body:

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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login

```
POST /auth/login
```

Request body:

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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get current user

```
GET /auth/me
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "5f7d0b9d8e8e8e8e8e8e8e8e",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Users

#### Get user profile

```
GET /users/:id
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "5f7d0b9d8e8e8e8e8e8e8e8e",
    "name": "John Doe",
    "role": "user",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Update user profile

```
PUT /users/profile
```

Request body:

```json
{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "5f7d0b9d8e8e8e8e8e8e8e8e",
    "name": "John Updated",
    "email": "john.updated@example.com",
    "role": "user",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Questions

#### Get all questions

```
GET /questions
```

Query parameters:
- `newest=true` - Sort by newest
- `unanswered=true` - Show only unanswered questions
- `tag=javascript` - Filter by tag slug
- `page=1` - Page number
- `limit=10` - Items per page

Response:

```json
{
  "success": true,
  "count": 2,
  "pagination": {
    "next": { "page": 2, "limit": 10 },
    "total": 15,
    "pages": 2,
    "current": 1
  },
  "data": [
    {
      "_id": "5f7d0b9d8e8e8e8e8e8e8e8e",
      "title": "How to center a div?",
      "description": "<p>I'm trying to center a div...</p>",
      "user": {
        "_id": "5f7d0b9d8e8e8e8e8e8e8e8e",
        "name": "John Doe"
      },
      "tags": [
        {
          "_id": "5f7d0b9d8e8e8e8e8e8e8e8e",
          "name": "CSS",
          "slug": "css"
        }
      ],
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get question by ID

```
GET /questions/:id
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "5f7d0b9d8e8e8e8e8e8e8e8e",
    "title": "How to center a div?",
    "description": "<p>I'm trying to center a div...</p>",
    "user": {
      "_id": "5f7d0b9d8e8e8e8e8e8e8e8e",
      "name": "John Doe"
    },
    "tags": [
      {
        "_id": "5f7d0b9d8e8e8e8e8e8e8e8e",
        "name": "CSS",
        "slug": "css"
      }
    ],
    "answers": [
      {
        "_id": "5f7d0b9d8e8e8e8e8e8e8e8e",
        "content": "<p>You can use flexbox...</p>",
        "isAccepted": false,
        "user": {
          "_id": "5f7d0b9d8e8e8e8e8e8e8e8e",
          "name": "Jane Smith"
        },
        "createdAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Create a question

```
POST /questions
```

Request body:

```json
{
  "title": "How to use async/await in JavaScript?",
  "description": "<p>I'm trying to understand how to use async/await...</p>",
  "tags": ["JavaScript", "Async"]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "5f7d0b9d8e8e8e8e8e8e8e8e",
    "title": "How to use async/await in JavaScript?",
    "description": "<p>I'm trying to understand how to use async/await...</p>",
    "user": "5f7d0b9d8e8e8e8e8e8e8e8e",
    "tags": [
      "5f7d0b9d8e8e8e8e8e8e8e8e",
      "5f7d0b9d8e8e8e8e8e8e8e8f"
    ],
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Delete a question

```
DELETE /questions/:id
```

Response:

```json
{
  "success": true,
  "data": {}
}
```

#### Add an answer to a question

```
POST /questions/:id/answers
```

Request body:

```json
{
  "content": "<p>Here's how you can solve this problem...</p>"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "5f7d0b9d8e8e8e8e8e8e8e8e",
    "content": "<p>Here's how you can solve this problem...</p>",
    "question": "5f7d0b9d8e8e8e8e8e8e8e8e",
    "user": "5f7d0b9d8e8e8e8e8e8e8e8e",
    "isAccepted": false,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Answers

#### Accept an answer

```
PUT /answers/:id/accept
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "5f7d0b9d8e8e8e8e8e8e8e8e",
    "content": "<p>Here's how you can solve this problem...</p>",
    "question": "5f7d0b9d8e8e8e8e8e8e8e8e",
    "user": "5f7d0b9d8e8e8e8e8e8e8e8e",
    "isAccepted": true,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Delete an answer

```
DELETE /answers/:id
```

Response:

```json
{
  "success": true,
  "data": {}
}
```

#### Vote on an answer

```
POST /answers/:id/vote
```

Request body:

```json
{
  "voteType": "up"  // or "down"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "5f7d0b9d8e8e8e8e8e8e8e8e",
    "voteType": "up",
    "answer": "5f7d0b9d8e8e8e8e8e8e8e8e",
    "user": "5f7d0b9d8e8e8e8e8e8e8e8e",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Get vote counts for an answer

```
GET /answers/:id/votes
```

Response:

```json
{
  "success": true,
  "data": {
    "upvotes": 5,
    "downvotes": 2,
    "total": 3
  }
}
```

### Tags

#### Get all tags

```
GET /tags
```

Response:

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "5f7d0b9d8e8e8e8e8e8e8e8e",
      "name": "JavaScript",
      "slug": "javascript",
      "createdAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "5f7d0b9d8e8e8e8e8e8e8e8f",
      "name": "CSS",
      "slug": "css",
      "createdAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "5f7d0b9d8e8e8e8e8e8e8e90",
      "name": "HTML",
      "slug": "html",
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get questions by tag

```
GET /tags/:slug/questions
```

Response:

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "5f7d0b9d8e8e8e8e8e8e8e8e",
      "title": "How to use async/await in JavaScript?",
      "description": "<p>I'm trying to understand how to use async/await...</p>",
      "user": {
        "_id": "5f7d0b9d8e8e8e8e8e8e8e8e",
        "name": "John Doe"
      },
      "tags": [
        {
          "_id": "5f7d0b9d8e8e8e8e8e8e8e8e",
          "name": "JavaScript",
          "slug": "javascript"
        }
      ],
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Notifications

#### Get user's notifications

```
GET /notifications
```

Response:

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "5f7d0b9d8e8e8e8e8e8e8e8e",
      "message": "Your question received a new answer",
      "link": "/questions/5f7d0b9d8e8e8e8e8e8e8e8e",
      "isRead": false,
      "createdAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "5f7d0b9d8e8e8e8e8e8e8e8f",
      "message": "Your answer was accepted",
      "link": "/questions/5f7d0b9d8e8e8e8e8e8e8e8f",
      "isRead": true,
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Mark notification as read

```
PUT /notifications/:id/read
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "5f7d0b9d8e8e8e8e8e8e8e8e",
    "message": "Your question received a new answer",
    "link": "/questions/5f7d0b9d8e8e8e8e8e8e8e8e",
    "isRead": true,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Mark all notifications as read

```
PUT /notifications/read-all
```

Response:

```json
{
  "success": true,
  "data": {
    "message": "All notifications marked as read"
  }
}
```

### Admin

#### Get all users (admin only)

```
GET /admin/users
```

Response:

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "5f7d0b9d8e8e8e8e8e8e8e8e",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "isBanned": false,
      "createdAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "5f7d0b9d8e8e8e8e8e8e8e8f",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isBanned": false,
      "createdAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "5f7d0b9d8e8e8e8e8e8e8e90",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "user",
      "isBanned": true,
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Delete a question (admin only)

```
DELETE /admin/questions/:id
```

Response:

```json
{
  "success": true,
  "data": {}
}
```

#### Delete an answer (admin only)

```
DELETE /admin/answers/:id
```

Response:

```json
{
  "success": true,
  "data": {}
}
```

#### Ban a user (admin only)

```
PUT /admin/ban/:userId
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "5f7d0b9d8e8e8e8e8e8e8e8e",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isBanned": true,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Unban a user (admin only)

```
PUT /admin/unban/:userId
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "5f7d0b9d8e8e8e8e8e8e8e8e",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isBanned": false,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

## Error Codes

- `400` - Bad Request (validation error, duplicate entry)
- `401` - Unauthorized (invalid credentials, token expired)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `500` - Server Error

## Mentions

Users can be mentioned in questions and answers using the `@username` syntax. When a user is mentioned, they will receive a notification with a link to the content where they were mentioned.

## Mobile Compatibility

The API is designed to be consumed by both web and mobile clients. All endpoints return JSON data that can be easily parsed by any client application.