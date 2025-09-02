# Quick Test Curl Commands
# Copy and paste these commands one by one in your terminal

# 1. Test server is running
curl -X GET "http://localhost:3000/api/categories"

# 2. User signup
curl -X POST "http://localhost:3000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User", 
    "email": "testuser@example.com",
    "password": "password123",
    "phone": "+1234567890"
  }'

# 3. User login (save the token from response)
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123"
  }'

# 4. Set this variable with your actual token from login response
# TOKEN="your_jwt_token_here"

# 5. Get user profile
curl -X GET "http://localhost:3000/api/auth/profile" \
  -H "Authorization: Bearer $TOKEN"

# 6. Get all categories
curl -X GET "http://localhost:3000/api/categories"

# 7. Set user preferences (use actual category IDs from step 6)
curl -X POST "http://localhost:3000/api/preferences" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "categoryIds": [1, 2, 3]
  }'

# 8. Get user preferences
curl -X GET "http://localhost:3000/api/preferences" \
  -H "Authorization: Bearer $TOKEN"

# 9. Get personalized posts
curl -X GET "http://localhost:3000/api/posts/personalized?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN"

# 10. Get suggested posts (trending)
curl -X GET "http://localhost:3000/api/posts/suggested?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN"

# 11. Get all posts (auto-personalizes for authenticated users)
curl -X GET "http://localhost:3000/api/posts?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN"

# 12. Get all posts without authentication (general posts)
curl -X GET "http://localhost:3000/api/posts?page=1&limit=5"
