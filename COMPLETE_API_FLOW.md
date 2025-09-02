# 🚀 Complete API Flow: From Signup to Personalized Content

## 📋 **COMPLETE TESTING FLOW - Step by Step**

### **Prerequisites**
- ✅ Server running: `npm run dev`
- ✅ Database connected
- ✅ Server accessible at: `http://localhost:3000`

---

## **🔥 STEP 1: USER SIGNUP**

### Create a new user account

```bash
curl -X POST "http://localhost:3000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe", 
    "email": "john.doe@example.com",
    "password": "password123",
    "phone": "+1234567890"
  }'
```

### Expected Response:
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
      "profileImage": null,
      "hasSetPreferences": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User created successfully"
}
```

**📝 Note**: Save the `token` from this response!

---

## **🔑 STEP 2: USER LOGIN**

### Login to get authentication token

```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

### Expected Response:
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

**🔐 IMPORTANT**: Copy the `token` value and set it as environment variable:
```bash
export TOKEN="your_actual_token_here"
```

---

## **👤 STEP 3: GET USER PROFILE**

### Verify authentication and get user details

```bash
curl -X GET "http://localhost:3000/api/auth/profile" \
  -H "Authorization: Bearer $TOKEN"
```

### Expected Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "profileImage": null,
    "role": "USER",
    "createdAt": "2025-09-02T16:00:00.000Z",
    "updatedAt": "2025-09-02T16:00:00.000Z"
  },
  "message": "User profile fetched successfully"
}
```

---

## **📂 STEP 4: GET ALL CATEGORIES**

### Discover available content categories

```bash
curl -X GET "http://localhost:3000/api/categories"
```

### Expected Response:
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Technology",
        "imageUrl": "https://example.com/tech.jpg",
        "popularity": 100,
        "createdAt": "2025-09-02T15:00:00.000Z"
      },
      {
        "id": 2,
        "name": "Sports",
        "imageUrl": "https://example.com/sports.jpg",
        "popularity": 85,
        "createdAt": "2025-09-02T15:00:00.000Z"
      },
      {
        "id": 3,
        "name": "Entertainment",
        "imageUrl": "https://example.com/entertainment.jpg",
        "popularity": 90,
        "createdAt": "2025-09-02T15:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalCategories": 3
    }
  },
  "message": "Categories fetched successfully"
}
```

**📝 Note**: Remember the category IDs (1, 2, 3) for the next step!

---

## **⭐ STEP 5: SET USER PREFERENCES (FIRST TIME)**

### Choose favorite categories for personalization

```bash
curl -X POST "http://localhost:3000/api/preferences" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "categoryIds": [1, 2, 3]
  }'
```

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
        "imageUrl": "https://example.com/tech.jpg"
      }
    },
    {
      "id": 2,
      "userId": 1,
      "categoryId": 2,
      "weight": 1.0,
      "createdAt": "2025-09-02T16:30:00.000Z",
      "updatedAt": "2025-09-02T16:30:00.000Z",
      "category": {
        "id": 2,
        "name": "Sports",
        "imageUrl": "https://example.com/sports.jpg"
      }
    }
  ],
  "message": "User preferences set successfully"
}
```

**🎉 Milestone**: User now has preferences set! `hasSetPreferences` becomes `true`

---

## **📋 STEP 6: GET USER PREFERENCES**

### View current user preferences

```bash
curl -X GET "http://localhost:3000/api/preferences" \
  -H "Authorization: Bearer $TOKEN"
```

### Expected Response:
```json
{
  "success": true,
  "data": {
    "hasSetPreferences": true,
    "preferences": [
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
          "imageUrl": "https://example.com/tech.jpg",
          "popularity": 100
        }
      }
    ]
  },
  "message": "User preferences fetched successfully"
}
```

---

## **📱 STEP 7: GET ALL POSTS (WITHOUT AUTHENTICATION)**

### See general posts (no personalization)

```bash
curl -X GET "http://localhost:3000/api/posts?page=1&limit=5"
```

### Expected Response:
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 1,
        "attachment": "https://cloudinary.com/image1.jpg",
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
          "imageUrl": "https://example.com/tech.jpg"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalPosts": 10,
      "postsPerPage": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "personalized": false
  },
  "message": "Posts fetched successfully"
}
```

**📝 Note**: `personalized: false` - no personalization applied

---

## **🎯 STEP 8: GET ALL POSTS (WITH AUTHENTICATION)**

### See auto-personalized posts (70% personalized + 30% diverse)

```bash
curl -X GET "http://localhost:3000/api/posts?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN"
```

### Expected Response:
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 3,
        "attachment": "https://cloudinary.com/image3.jpg",
        "categoryId": 1,
        "createdAt": "2025-09-02T15:45:00.000Z",
        "likeCount": 8,
        "_count": {
          "likes": 8,
          "comments": 2
        },
        "category": {
          "id": 1,
          "name": "Technology",
          "imageUrl": "https://example.com/tech.jpg"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalPosts": 10,
      "postsPerPage": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "personalized": true
  },
  "message": "Personalized posts fetched successfully"
}
```

**🎯 Note**: `personalized: true` - content is now personalized!

---

## **🤖 STEP 9: GET PERSONALIZED POSTS (ADVANCED ALGORITHM)**

### See posts ranked by sophisticated algorithm

```bash
curl -X GET "http://localhost:3000/api/posts/personalized?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN"
```

### Expected Response:
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 1,
        "attachment": "https://cloudinary.com/image1.jpg",
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
          "imageUrl": "https://example.com/tech.jpg",
          "popularity": 100
        },
        "relevanceScore": 185.5
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalPosts": 5,
      "postsPerPage": 5,
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
        },
        {
          "id": 2,
          "name": "Sports",
          "weight": 1.0
        }
      ]
    }
  },
  "message": "Personalized posts fetched successfully"
}
```

**🧠 Note**: Each post has a `relevanceScore` showing algorithm ranking!

---

## **💡 STEP 10: GET SUGGESTED POSTS (TRENDING)**

### See trending posts for discovery

```bash
curl -X GET "http://localhost:3000/api/posts/suggested?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN"
```

### Expected Response:
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 7,
        "attachment": "https://cloudinary.com/trending1.jpg",
        "categoryId": 3,
        "createdAt": "2025-09-01T16:00:00.000Z",
        "likeCount": 25,
        "_count": {
          "likes": 25,
          "comments": 8
        },
        "category": {
          "id": 3,
          "name": "Entertainment",
          "imageUrl": "https://example.com/entertainment.jpg"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalPosts": 3,
      "postsPerPage": 5,
      "hasNextPage": false,
      "hasPrevPage": false
    },
    "suggestion": {
      "type": "trending",
      "description": "Posts that are trending in the last 7 days"
    }
  },
  "message": "Suggested posts fetched successfully"
}
```

**🔥 Note**: Shows trending posts from last 7 days, great for discovery!

---

## **⚙️ STEP 11: UPDATE PREFERENCE WEIGHT**

### Fine-tune preference strength

```bash
curl -X PUT "http://localhost:3000/api/preferences/1/weight" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "weight": 2.5
  }'
```

### Expected Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "categoryId": 1,
    "weight": 2.5,
    "createdAt": "2025-09-02T16:30:00.000Z",
    "updatedAt": "2025-09-02T16:45:00.000Z",
    "category": {
      "id": 1,
      "name": "Technology",
      "imageUrl": "https://example.com/tech.jpg"
    }
  },
  "message": "Preference weight updated successfully"
}
```

**⚡ Effect**: Technology posts will now rank higher in personalized feeds!

---

## **📊 STEP 12: GET POSTS BY CATEGORY**

### Browse posts from specific category

```bash
curl -X GET "http://localhost:3000/api/posts/category/1?page=1&limit=5"
```

### Expected Response:
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 1,
        "attachment": "https://cloudinary.com/tech1.jpg",
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
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalPosts": 3,
      "postsPerPage": 5
    },
    "category": {
      "id": 1,
      "name": "Technology",
      "imageUrl": "https://example.com/tech.jpg"
    }
  },
  "message": "Posts from category 'Technology' fetched successfully"
}
```

---

## **🔍 STEP 13: SEARCH POSTS**

### Search for specific content

```bash
curl -X GET "http://localhost:3000/api/posts/search?q=technology&page=1&limit=5"
```

### Expected Response:
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 1,
        "attachment": "https://cloudinary.com/tech1.jpg",
        "categoryId": 1,
        "createdAt": "2025-09-02T16:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalPosts": 2,
      "postsPerPage": 5
    },
    "search": {
      "query": "technology",
      "categoryId": null,
      "totalResults": 2
    }
  },
  "message": "Search results for \"technology\" fetched successfully"
}
```

---

## **❌ STEP 14: REMOVE PREFERENCE**

### Remove a category from preferences

```bash
curl -X DELETE "http://localhost:3000/api/preferences/2" \
  -H "Authorization: Bearer $TOKEN"
```

### Expected Response:
```json
{
  "success": true,
  "data": null,
  "message": "Preference removed successfully"
}
```

**📉 Effect**: Sports posts will no longer be prioritized in personalized feeds!

---

## **🎉 COMPLETE FLOW SUMMARY**

### **What We Achieved:**

1. ✅ **User Account**: Created and authenticated user
2. ✅ **Preferences Setup**: Configured content preferences  
3. ✅ **Personalization Active**: Algorithm now personalizes content
4. ✅ **Multiple Feed Types**: 
   - General posts (no auth)
   - Auto-personalized posts (with auth)
   - Advanced personalized posts (algorithm-ranked)
   - Suggested trending posts
5. ✅ **Preference Management**: Updated weights and removed categories
6. ✅ **Content Discovery**: Category browsing and search

### **Key Differences Observed:**

| Endpoint | Personalization | Use Case |
|----------|----------------|----------|
| `GET /posts` (no auth) | ❌ None | General browsing |
| `GET /posts` (with auth) | 🟡 Auto (70/30 mix) | Main feed |
| `GET /posts/personalized` | 🎯 Advanced algorithm | Highly relevant content |
| `GET /posts/suggested` | 💡 Trending discovery | New content exploration |

### **Flutter Integration Ready!** 🚀

Your personalized posts system is now **production-ready** with:
- ✅ User onboarding flow
- ✅ Preference management
- ✅ Multiple personalization levels
- ✅ Content discovery features
- ✅ Analytics-ready scoring system

**Next Step**: Integrate these endpoints into your Flutter app for an amazing personalized user experience! 📱✨
