# User Preferences and Personalized Posts API Testing

## 1. First, login or signup to get a token
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

### Expected Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "user@example.com",
      "phone": "+1234567890",
      "hasSetPreferences": false
    },
    "token": "your-jwt-token"
  },
  "message": "Login successful"
}
```

## 2. Get all categories to know available categories
GET http://localhost:3000/api/categories

## 3. Set user preferences (first time users)
POST http://localhost:3000/api/preferences
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "categoryIds": [1, 2, 3]
}

### Expected Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "categoryId": 1,
      "weight": 1.0,
      "createdAt": "2025-09-02T16:30:00.000Z",
      "updatedAt": "2025-09-02T16:30:00.000Z",
      "category": {
        "id": 1,
        "name": "Technology",
        "imageUrl": "https://example.com/image.jpg"
      }
    }
  ],
  "message": "User preferences set successfully"
}
```

## 4. Get user preferences
GET http://localhost:3000/api/preferences
Authorization: Bearer YOUR_TOKEN_HERE

## 5. Get personalized posts (uses user preferences)
GET http://localhost:3000/api/posts/personalized?page=1&limit=10
Authorization: Bearer YOUR_TOKEN_HERE

### Expected Response:
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
        "updatedAt": "2025-09-02T16:00:00.000Z",
        "likeCount": 5,
        "_count": {
          "likes": 5,
          "comments": 3
        },
        "category": {
          "id": 1,
          "name": "Technology",
          "imageUrl": "https://example.com/image.jpg",
          "popularity": 100
        },
        "relevanceScore": 150.5
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalPosts": 1,
      "postsPerPage": 10,
      "hasNextPage": false,
      "hasPrevPage": false,
      "nextPage": null,
      "prevPage": null
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

## 6. Get suggested posts (for users without preferences)
GET http://localhost:3000/api/posts/suggested?page=1&limit=10
Authorization: Bearer YOUR_TOKEN_HERE

## 7. Update preference weight for a category
PUT http://localhost:3000/api/preferences/1/weight
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "weight": 2.5
}

## 8. Remove a preference
DELETE http://localhost:3000/api/preferences/1
Authorization: Bearer YOUR_TOKEN_HERE

---

## Algorithm Explanation

### Personalized Posts Algorithm:
1. **User Preferences Check**: Checks if user has set preferences
2. **Fallback for New Users**: If no preferences, shows popular and recent posts
3. **Preference-Based Scoring**: For users with preferences:
   - **Base Preference Score**: Higher weight = higher score (0-500 points)
   - **Engagement Bonus**: +20 points per past like in same category
   - **Popularity Bonus**: +5 points per category popularity point
   - **Recency Bonus**: Newer posts get slightly higher scores
   - **Like Ratio Bonus**: +2 points per like for preferred categories, +1 for others

### Suggested Posts Algorithm:
- Shows trending posts from the last 7 days
- Ordered by like count and recency
- Perfect for new users to discover popular content

### Key Features:
1. **Dynamic Preferences**: Users can update weights and remove categories
2. **Smart Fallbacks**: Always shows content even without preferences
3. **Engagement Learning**: Algorithm learns from user's likes
4. **Performance Optimized**: Uses SQL scoring for efficient queries
5. **Paginated Results**: Supports pagination for better UX
