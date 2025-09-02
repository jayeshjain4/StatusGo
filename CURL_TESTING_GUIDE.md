# Complete Curl Testing Guide for Personalized Posts APIs

## Base URL
```bash
BASE_URL="http://localhost:3000/api"
```

## 1. Authentication APIs

### Signup
```bash
curl -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe", 
    "email": "john.doe@example.com",
    "password": "password123",
    "phone": "+1234567890"
  }'
```

### Login
```bash
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

**Save the token from login response:**
```bash
TOKEN="your_jwt_token_here"
```

### Get User Profile
```bash
curl -X GET "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $TOKEN"
```

## 2. Categories APIs

### Get All Categories
```bash
curl -X GET "$BASE_URL/categories"
```

### Create Category (Admin only)
```bash
curl -X POST "$BASE_URL/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Technology",
    "imageUrl": "https://example.com/tech.jpg"
  }'
```

## 3. User Preferences APIs

### Set User Preferences (First Time)
```bash
curl -X POST "$BASE_URL/preferences" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "categoryIds": [1, 2, 3]
  }'
```

### Get User Preferences
```bash
curl -X GET "$BASE_URL/preferences" \
  -H "Authorization: Bearer $TOKEN"
```

### Update Preference Weight
```bash
curl -X PUT "$BASE_URL/preferences/1/weight" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "weight": 2.5
  }'
```

### Remove a Preference
```bash
curl -X DELETE "$BASE_URL/preferences/1" \
  -H "Authorization: Bearer $TOKEN"
```

## 4. Posts APIs

### Create Post (with file upload)
```bash
curl -X POST "$BASE_URL/posts" \
  -H "Authorization: Bearer $TOKEN" \
  -F "attachment=@/path/to/your/image.jpg" \
  -F "categoryId=1"
```

### Get All Posts (Auto-personalizes for authenticated users)
```bash
curl -X GET "$BASE_URL/posts?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Get All Posts (Without authentication - general posts)
```bash
curl -X GET "$BASE_URL/posts?page=1&limit=10"
```

### Get Personalized Posts (Advanced Algorithm)
```bash
curl -X GET "$BASE_URL/posts/personalized?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Suggested Posts (Trending for new users)
```bash
curl -X GET "$BASE_URL/posts/suggested?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Posts by Category
```bash
curl -X GET "$BASE_URL/posts/category/1?page=1&limit=10"
```

### Search Posts
```bash
curl -X GET "$BASE_URL/posts/search?q=technology&page=1&limit=10"
```

## 5. Interaction APIs

### Like a Post
```bash
curl -X POST "$BASE_URL/posts/1/like" \
  -H "Authorization: Bearer $TOKEN"
```

### Unlike a Post
```bash
curl -X DELETE "$BASE_URL/posts/1/like" \
  -H "Authorization: Bearer $TOKEN"
```

### Add Comment
```bash
curl -X POST "$BASE_URL/posts/1/comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "content": "Great post! Very informative."
  }'
```

### Get Post Comments
```bash
curl -X GET "$BASE_URL/posts/1/comments?page=1&limit=10"
```

## Complete Testing Flow Script

```bash
#!/bin/bash

# Set base URL
BASE_URL="http://localhost:3000/api"

echo "🚀 Starting API Testing Flow..."

# 1. Signup
echo "📝 Step 1: User Signup"
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User", 
    "email": "test@example.com",
    "password": "password123",
    "phone": "+1234567890"
  }')

echo "Signup Response: $SIGNUP_RESPONSE"

# 2. Login
echo "🔐 Step 2: User Login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo "Login Response: $LOGIN_RESPONSE"

# Extract token (requires jq)
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
echo "Token: $TOKEN"

# 3. Get Categories
echo "📂 Step 3: Get Categories"
CATEGORIES=$(curl -s -X GET "$BASE_URL/categories")
echo "Categories: $CATEGORIES"

# 4. Set Preferences
echo "⭐ Step 4: Set User Preferences"
PREFERENCES_RESPONSE=$(curl -s -X POST "$BASE_URL/preferences" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "categoryIds": [1, 2]
  }')

echo "Preferences Set: $PREFERENCES_RESPONSE"

# 5. Get Personalized Posts
echo "🎯 Step 5: Get Personalized Posts"
PERSONALIZED_POSTS=$(curl -s -X GET "$BASE_URL/posts/personalized?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN")

echo "Personalized Posts: $PERSONALIZED_POSTS"

# 6. Get Suggested Posts
echo "💡 Step 6: Get Suggested Posts"
SUGGESTED_POSTS=$(curl -s -X GET "$BASE_URL/posts/suggested?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN")

echo "Suggested Posts: $SUGGESTED_POSTS"

echo "✅ Testing Complete!"
```

## Error Response Examples

### Invalid Token
```json
{
  "success": false,
  "data": null,
  "message": "Invalid or expired token",
  "statusCode": 401
}
```

### Missing Required Fields
```json
{
  "success": false,
  "data": null,
  "message": "Category IDs must be a non-empty array",
  "statusCode": 400
}
```

### User Not Found
```json
{
  "success": false,
  "data": null,
  "message": "User not found",
  "statusCode": 404
}
```

## Success Response Examples

### Login Success
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "hasSetPreferences": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

### Personalized Posts Success
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 1,
        "attachment": "https://cloudinary.com/image.jpg",
        "categoryId": 1,
        "createdAt": "2025-09-02T16:00:00.000Z",
        "likeCount": 5,
        "_count": {
          "likes": 5,
          "comments": 3
        },
        "category": {
          "id": 1,
          "name": "Technology",
          "imageUrl": "https://example.com/tech.jpg"
        },
        "relevanceScore": 150.5
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalPosts": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    },
    "personalization": {
      "hasSetPreferences": true,
      "preferredCategories": [
        {
          "id": 1,
          "name": "Technology",
          "weight": 1.0
        }
      ]
    }
  },
  "message": "Personalized posts fetched successfully"
}
```

## Quick Test Commands

### Test if server is running
```bash
curl -X GET "$BASE_URL/categories"
```

### Test authentication
```bash
# Replace with your actual token
curl -X GET "$BASE_URL/preferences" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test personalization
```bash
# This will show different results based on user preferences
curl -X GET "$BASE_URL/posts/personalized" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
