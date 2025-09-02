# Individual Curl Commands - Copy and run these one by one

# ===== AUTHENTICATION =====

# 1. Signup
curl -X POST "http://localhost:3000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe", 
    "email": "john.doe@example.com",
    "password": "password123",
    "phone": "+1234567890"
  }'

# 2. Login (SAVE THE TOKEN!)
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }'

# Set this with your actual token:
# export TOKEN="your_jwt_token_here"

# 3. Get Profile
curl -X GET "http://localhost:3000/api/auth/profile" \
  -H "Authorization: Bearer $TOKEN"

# ===== CATEGORIES =====

# 4. Get All Categories
curl -X GET "http://localhost:3000/api/categories"

# ===== PREFERENCES =====

# 5. Set Preferences (use real category IDs from step 4)
curl -X POST "http://localhost:3000/api/preferences" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "categoryIds": [1, 2, 3]
  }'

# 6. Get Preferences
curl -X GET "http://localhost:3000/api/preferences" \
  -H "Authorization: Bearer $TOKEN"

# 7. Update Preference Weight
curl -X PUT "http://localhost:3000/api/preferences/1/weight" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "weight": 2.5
  }'

# ===== POSTS =====

# 8. Get Personalized Posts
curl -X GET "http://localhost:3000/api/posts/personalized?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN"

# 9. Get Suggested Posts (Trending)
curl -X GET "http://localhost:3000/api/posts/suggested?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN"

# 10. Get All Posts (Auto-personalized for authenticated users)
curl -X GET "http://localhost:3000/api/posts?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN"

# 11. Get All Posts (Without auth - general posts)
curl -X GET "http://localhost:3000/api/posts?page=1&limit=5"

# 12. Get Posts by Category
curl -X GET "http://localhost:3000/api/posts/category/1?page=1&limit=5"

# 13. Search Posts
curl -X GET "http://localhost:3000/api/posts/search?q=technology&page=1&limit=5"
