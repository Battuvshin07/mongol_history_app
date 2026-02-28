# 🏹 Mongol History Backend API

Backend API for the **13th Century Mongolian History App** built with Node.js, Express, and MongoDB.

---

## 📁 Folder Structure

```
backend/
├── server.js                          # Entry point
├── package.json                       # Dependencies & scripts
├── .env.example                       # Environment variables template
├── .gitignore
│
└── src/
    ├── config/
    │   ├── db.js                      # MongoDB connection
    │   └── constants.js               # App constants (roles, status codes)
    │
    ├── controllers/
    │   ├── auth.controller.js         # Register, Login, Profile
    │   ├── content.controller.js      # Generic content CRUD
    │   ├── person.controller.js       # Historical persons CRUD
    │   ├── event.controller.js        # Historical events CRUD
    │   ├── quiz.controller.js         # Quiz questions CRUD
    │   └── culture.controller.js      # Culture items CRUD
    │
    ├── middleware/
    │   ├── auth.middleware.js          # JWT verification
    │   ├── role.middleware.js          # Role-based access control
    │   ├── error.middleware.js         # Global error handler
    │   └── validate.middleware.js      # Input validation rules
    │
    ├── models/
    │   ├── User.model.js              # User schema (admin/user roles)
    │   ├── Content.model.js           # Generic content schema
    │   ├── Person.model.js            # Historical person schema
    │   ├── Event.model.js             # Historical event schema
    │   ├── Quiz.model.js              # Quiz question schema
    │   └── Culture.model.js           # Culture item schema
    │
    ├── routes/
    │   ├── auth.routes.js             # /api/auth/*
    │   ├── content.routes.js          # /api/content/*
    │   ├── person.routes.js           # /api/persons/*
    │   ├── event.routes.js            # /api/events/*
    │   ├── quiz.routes.js             # /api/quizzes/*
    │   └── culture.routes.js          # /api/culture/*
    │
    ├── services/
    │   ├── auth.service.js            # Auth business logic
    │   └── data.service.js            # Data access helpers
    │
    └── utils/
        ├── response.helper.js         # Response formatting utilities
        └── seeder.js                  # Database seeder script
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or Atlas cloud)
- **npm**

### Installation

```bash
# 1. Navigate to backend folder
cd backend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Edit .env with your values
#    - Set MONGO_URI to your MongoDB connection string
#    - Set JWT_SECRET to a strong random string

# 5. Seed the database (imports Flutter app's JSON data)
npm run seed

# 6. Start the server
npm run dev    # Development (with auto-reload)
npm start      # Production
```

The server starts at `http://localhost:5000`.

---

## 🔐 Authentication

### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "user": {
      "id": "65f...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isActive": true,
      "lastLogin": null,
      "createdAt": "2026-02-28T...",
      "updatedAt": "2026-02-28T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Get Profile (Protected)
```
GET /api/auth/me
Authorization: Bearer <token>
```

---

## 📦 Content API (Role-Based)

### Get All Content (Public)
```
GET /api/content?page=1&limit=10&category=featured
```

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "total": 12,
  "page": 1,
  "pages": 2,
  "data": {
    "content": [
      {
        "title": "The Rise of the Mongol Empire",
        "description": "...",
        "imageUrl": "https://...",
        "category": "featured",
        "isPublished": true,
        "author": { "name": "Admin", "email": "admin@mongolhistory.com" },
        "createdAt": "2026-02-28T...",
        "updatedAt": "2026-02-28T..."
      }
    ]
  }
}
```

### Create Content (Admin Only)
```
POST /api/content
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "New Article Title",
  "description": "Article description here...",
  "imageUrl": "https://example.com/image.jpg",
  "category": "news"
}
```

### Update Content (Admin Only)
```
PUT /api/content/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "Updated Title"
}
```

### Delete Content (Admin Only)
```
DELETE /api/content/:id
Authorization: Bearer <admin-token>
```

---

## 👤 Domain APIs

All domain endpoints follow the same pattern:

| Resource   | Base URL         | List Key   | ID Param     |
|------------|------------------|------------|--------------|
| Persons    | `/api/persons`   | `persons`  | `:personId`  |
| Events     | `/api/events`    | `events`   | `:eventId`   |
| Quizzes    | `/api/quizzes`   | `quizzes`  | `:quizId`    |
| Culture    | `/api/culture`   | `culture`  | `:id`        |

**Operations:**
- `GET /` — List all (public, paginated)
- `GET /:id` — Get single (public)
- `POST /` — Create (admin only)
- `PUT /:id` — Update (admin only)
- `DELETE /:id` — Delete (admin only)

### Example: Get All Persons
```
GET /api/persons?page=1&limit=20&search=Genghis
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "total": 1,
  "page": 1,
  "pages": 1,
  "data": {
    "persons": [
      {
        "person_id": 1,
        "name": "Чингис хаан",
        "birth_date": "1162",
        "death_date": "1227",
        "description": "Монголын эзэнт гүрний үндэслэгч...",
        "image_url": null
      }
    ]
  }
}
```

### Example: Get Events for a Person
```
GET /api/events?personId=1
```

---

## 🔑 Role-Based Access

| Action              | `user` Role | `admin` Role |
|---------------------|:-----------:|:------------:|
| View content        | ✅          | ✅           |
| View own profile    | ✅          | ✅           |
| Create content      | ❌          | ✅           |
| Update content      | ❌          | ✅           |
| Delete content      | ❌          | ✅           |
| View all users      | ❌          | ✅           |

---

## 📱 Flutter Integration Guide

### API Base URL

In your Flutter app, configure the API base URL:

```dart
// lib/services/api_service.dart

class ApiService {
  // For Android emulator → use 10.0.2.2 instead of localhost
  // For iOS simulator  → use localhost
  // For physical device → use your computer's local IP
  static const String baseUrl = 'http://10.0.2.2:5000/api';

  // For production
  // static const String baseUrl = 'https://your-domain.com/api';
}
```

### Making API Requests from Flutter

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:5000/api';
  String? _token;

  // Set token after login
  void setToken(String token) => _token = token;

  // Headers with JWT
  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_token != null) 'Authorization': 'Bearer $_token',
  };

  // LOGIN
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    final data = jsonDecode(response.body);
    if (data['success']) {
      _token = data['data']['token'];
    }
    return data;
  }

  // GET ALL PERSONS
  Future<List<dynamic>> getPersons({int page = 1, int limit = 20}) async {
    final response = await http.get(
      Uri.parse('$baseUrl/persons?page=$page&limit=$limit'),
      headers: _headers,
    );
    final data = jsonDecode(response.body);
    return data['data']['persons'];
  }

  // CREATE CONTENT (Admin only)
  Future<Map<String, dynamic>> createContent(Map<String, dynamic> content) async {
    final response = await http.post(
      Uri.parse('$baseUrl/content'),
      headers: _headers,
      body: jsonEncode(content),
    );
    return jsonDecode(response.body);
  }
}
```

### Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description here",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

---

## 🧪 Default Admin Account

After running `npm run seed`:

| Field    | Value                       |
|----------|-----------------------------|
| Email    | `admin@mongolhistory.com`   |
| Password | `admin123456`               |
| Role     | `admin`                     |

> ⚠️ **Change these credentials in production!**

---

## 🛡️ Security Features

- **JWT Authentication** with configurable expiry
- **bcrypt** password hashing (12 salt rounds)
- **Helmet** security headers
- **CORS** configured for specific origins
- **Rate limiting** (100 requests per 15 minutes)
- **Input validation** with express-validator
- **Centralized error handling** with proper HTTP status codes
- **MongoDB injection** protection via Mongoose sanitization

---

## 📋 Environment Variables

| Variable              | Description                        | Default                |
|-----------------------|------------------------------------|------------------------|
| `NODE_ENV`            | Environment mode                   | `development`          |
| `PORT`                | Server port                        | `5000`                 |
| `MONGO_URI`           | MongoDB connection string          | `mongodb://localhost:27017/mongol_history_db` |
| `JWT_SECRET`          | Secret key for JWT signing         | (required)             |
| `JWT_EXPIRE`          | Token expiration duration          | `7d`                   |
| `CLIENT_URL`          | Allowed CORS origin                | `*`                    |
| `RATE_LIMIT_WINDOW_MS`| Rate limit window in milliseconds | `900000` (15 min)      |
| `RATE_LIMIT_MAX`      | Max requests per window            | `100`                  |
