# API Documentation

## Authentication
Base URL: `/api`

### Login
```http
POST /user/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "specialization": "Developer",
    "experience_years": 5,
    "skills": ["JavaScript", "Node.js"],
    "profile_image": "image_url"
  },
  "token": "jwt_token"
}
```

## User Management

### Update Profile
```http
PUT /user/profile
```

**Request Body:**
```json
{
  "name": "John Doe",
  "specialization": "Senior Developer",
  "experience_years": 6,
  "skills": ["JavaScript", "Node.js", "React"],
  "profile_image": "file_upload"
}
```

### Search Users
```http
GET /user/search?query=john
```

## Forums

### Create Forum
```http
POST /forums
```

**Request Body:**
```json
{
  "name": "Development Team",
  "description": "Forum for development team discussions",
  "settings": {
    "can_members_create_events": true,
    "can_members_create_meetings": true
  }
}
```

### Get Forum
```http
GET /forums/:forumId
```

### Update Forum
```http
PUT /forums/:forumId
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

### Delete Forum
```http
DELETE /forums/:forumId
```

### Get Forum Members
```http
GET /forums/:forumId/members
```

### Remove Member
```http
DELETE /forums/:forumId/members/:memberId
```

## Posts

### Create Post
```http
POST /post
```

**Request Body (multipart/form-data):**
```
title: "Post Title"
content: "Post content"
forum_id: "forum_id"
files: [file1, file2]
```

### Get Post
```http
GET /post/:postId
```

### Update Post
```http
PUT /post/:postId
```

**Request Body (multipart/form-data):**
```
title: "Updated Title"
content: "Updated content"
files: [file1, file2]
```

### Delete Post
```http
DELETE /post/:postId
```

### Get Forum Posts
```http
GET /post/forum/:forumId
```

## Comments

### Create Comment
```http
POST /comment
```

**Request Body:**
```json
{
  "content": "Comment content",
  "post_id": "post_id"
}
```

### Update Comment
```http
PUT /comment/:commentId
```

**Request Body:**
```json
{
  "content": "Updated comment"
}
```

### Delete Comment
```http
DELETE /comment/:commentId
```

### Get Post Comments
```http
GET /comment/post/:postId
```

## Messages

### Send Message
```http
POST /message
```

**Request Body:**
```json
{
  "content": "Message content",
  "receiver_id": "receiver_id"
}
```

### Get Messages
```http
GET /message/user/:userId
```

### Delete Message
```http
DELETE /message/:messageId
```

### Mark Message as Read
```http
PUT /message/:messageId/read
```

### Get Unread Messages
```http
GET /message/unread
```

### Get User Chats
```http
GET /message/chats
```

## Meetings

### Create Direct Meeting
```http
POST /meeting/direct
```

**Request Body:**
```json
{
  "title": "1-on-1 Meeting",
  "description": "Direct meeting description",
  "receiver_id": "receiver_id",
  "start_time": "2024-12-24T10:00:00Z",
  "end_time": "2024-12-24T11:00:00Z"
}
```

### Create Forum Meeting
```http
POST /meeting/forum
```

**Request Body:**
```json
{
  "title": "Team Meeting",
  "description": "Forum meeting description",
  "forum_id": "forum_id",
  "start_time": "2024-12-24T14:00:00Z",
  "end_time": "2024-12-24T15:00:00Z"
}
```

### Update Meeting
```http
PUT /meeting/:meetingId
```

### Delete Meeting
```http
DELETE /meeting/:meetingId
```

### Join Meeting
```http
POST /meeting/:meetingId/join
```

### Leave Meeting
```http
POST /meeting/:meetingId/leave
```

### Start Meeting
```http
POST /meeting/:meetingId/start
```

### End Meeting
```http
POST /meeting/:meetingId/end
```

### Get User Meetings
```http
GET /meeting/user
```

### Get Active Meeting
```http
GET /meeting/:meetingId
```

## Events

### Create Event
```http
POST /forums/events
```

**Request Body:**
```json
{
  "title": "Team Building",
  "description": "Team building event",
  "date": "2024-12-25T09:00:00Z",
  "location": "Office",
  "forum_id": "forum_id"
}
```

### Get Forum Events
```http
GET /forums/events/:forumId
```

### Get Event
```http
GET /forums/event/:eventId
```

### Update Event
```http
PUT /forums/event/:eventId
```

### Delete Event
```http
DELETE /forums/event/:eventId
```

### Update Event Participation
```http
POST /forums/event/:eventId/participate
```

**Request Body:**
```json
{
  "status": "accepted" // or "declined", "pending"
}
```
