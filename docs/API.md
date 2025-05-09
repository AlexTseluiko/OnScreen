# API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

### Login

```http
POST /auth/login
```

Request body:

```json
{
  "email": "string",
  "password": "string"
}
```

Response:

```json
{
  "token": "string",
  "refreshToken": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "string"
  }
}
```

### Register

```http
POST /auth/register
```

Request body:

```json
{
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string"
}
```

Response:

```json
{
  "token": "string",
  "refreshToken": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "string"
  }
}
```

### Refresh Token

```http
POST /auth/refresh
```

Request body:

```json
{
  "refreshToken": "string"
}
```

Response:

```json
{
  "token": "string",
  "refreshToken": "string"
}
```

## Facilities

### Get All Facilities

```http
GET /facilities
```

Query parameters:

- `page`: number (default: 1)
- `limit`: number (default: 20)
- `search`: string
- `specialties`: string[] (comma-separated)
- `services`: string[] (comma-separated)
- `rating`: number
- `sort`: string (rating, distance, price)

Response:

```json
{
  "facilities": [
    {
      "id": "string",
      "name": "string",
      "address": "string",
      "coordinates": {
        "lat": number,
        "lng": number
      },
      "specialties": ["string"],
      "services": ["string"],
      "rating": number,
      "reviews": number,
      "workingHours": {
        "monday": "string",
        "tuesday": "string",
        "wednesday": "string",
        "thursday": "string",
        "friday": "string",
        "saturday": "string",
        "sunday": "string"
      },
      "phone": "string",
      "email": "string",
      "website": "string"
    }
  ],
  "total": number,
  "page": number,
  "limit": number
}
```

### Get Facility Details

```http
GET /facilities/:id
```

Response:

```json
{
  "id": "string",
  "name": "string",
  "address": "string",
  "coordinates": {
    "lat": number,
    "lng": number
  },
  "specialties": ["string"],
  "services": ["string"],
  "rating": number,
  "reviews": [
    {
      "id": "string",
      "userId": "string",
      "userName": "string",
      "rating": number,
      "comment": "string",
      "createdAt": "string"
    }
  ],
  "workingHours": {
    "monday": "string",
    "tuesday": "string",
    "wednesday": "string",
    "thursday": "string",
    "friday": "string",
    "saturday": "string",
    "sunday": "string"
  },
  "phone": "string",
  "email": "string",
  "website": "string",
  "description": "string",
  "images": ["string"]
}
```

## Reviews

### Add Review

```http
POST /facilities/:id/reviews
```

Request body:

```json
{
  "rating": number,
  "comment": "string"
}
```

Response:

```json
{
  "id": "string",
  "userId": "string",
  "userName": "string",
  "rating": number,
  "comment": "string",
  "createdAt": "string"
}
```

### Get Facility Reviews

```http
GET /facilities/:id/reviews
```

Query parameters:

- `page`: number (default: 1)
- `limit`: number (default: 10)
- `sort`: string (newest, oldest, highest, lowest)

Response:

```json
{
  "reviews": [
    {
      "id": "string",
      "userId": "string",
      "userName": "string",
      "rating": number,
      "comment": "string",
      "createdAt": "string"
    }
  ],
  "total": number,
  "page": number,
  "limit": number
}
```

## User Profile

### Get User Profile

```http
GET /profile
```

Response:

```json
{
  "id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "role": "string",
  "favorites": ["string"],
  "createdAt": "string",
  "updatedAt": "string"
}
```

### Update User Profile

```http
PUT /profile
```

Request body:

```json
{
  "firstName": "string",
  "lastName": "string",
  "phone": "string"
}
```

Response:

```json
{
  "id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "role": "string",
  "favorites": ["string"],
  "createdAt": "string",
  "updatedAt": "string"
}
```

### Change Password

```http
PUT /profile/password
```

Request body:

```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

Response:

```json
{
  "message": "Password updated successfully"
}
```

## Favorites

### Add to Favorites

```http
POST /favorites/:facilityId
```

Response:

```json
{
  "message": "Facility added to favorites"
}
```

### Remove from Favorites

```http
DELETE /favorites/:facilityId
```

Response:

```json
{
  "message": "Facility removed from favorites"
}
```

### Get Favorites

```http
GET /favorites
```

Response:

```json
{
  "facilities": [
    {
      "id": "string",
      "name": "string",
      "address": "string",
      "coordinates": {
        "lat": number,
        "lng": number
      },
      "specialties": ["string"],
      "services": ["string"],
      "rating": number,
      "reviews": number
    }
  ]
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "error": "string",
  "message": "string",
  "details": {}
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found

```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

API requests are limited to:

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

When rate limit is exceeded, the API will return:

```http
429 Too Many Requests
```

Response:

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded",
  "retryAfter": number
}
```

## Authentication Headers

For authenticated endpoints, include the following header:

```http
Authorization: Bearer <token>
```

## Pagination

All list endpoints support pagination with the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

Response includes pagination metadata:

```json
{
  "data": [],
  "total": number,
  "page": number,
  "limit": number,
  "pages": number
}
```
