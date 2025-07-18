#!/bin/bash

# =============================================================================
# LIKE AND COMMENT API CURL COMMANDS (BASH VERSION)
# =============================================================================

# Configuration
BASE_URL="http://localhost:3000"
TOKEN="YOUR_JWT_TOKEN_HERE"  # Replace with actual token
POST_ID="1"  # Replace with actual post ID
COMMENT_ID="1"  # Replace with actual comment ID
CATEGORY_ID="1"  # Replace with actual category ID

echo "=== LIKE FUNCTIONALITY ==="

# 1. Toggle Like/Unlike a Post (requires authentication)
echo -e "\n1. Like/Unlike a Post:"
curl -X POST "$BASE_URL/api/posts/$POST_ID/like" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n"

# 2. Get All Likes for a Post (no authentication required)
echo "2. Get All Likes for a Post:"
curl -X GET "$BASE_URL/api/posts/$POST_ID/likes?page=1&limit=10" \
  -H "Content-Type: application/json"

echo -e "\n=== COMMENT FUNCTIONALITY ===\n"

# 3. Create a Comment (requires authentication)
echo "3. Create a Comment:"
curl -X POST "$BASE_URL/api/posts/$POST_ID/comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "content": "This is a great post! I really like it."
  }'

echo -e "\n"

# 4. Get All Comments for a Post (no authentication required)
echo "4. Get All Comments for a Post:"
curl -X GET "$BASE_URL/api/posts/$POST_ID/comments?page=1&limit=10" \
  -H "Content-Type: application/json"

echo -e "\n"

# 5. Delete a Comment (requires authentication - only comment owner)
echo "5. Delete a Comment:"
curl -X DELETE "$BASE_URL/api/posts/$POST_ID/comments/$COMMENT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n=== GET POSTS WITH LIKE/COMMENT COUNTS ===\n"

# 6. Get All Posts with Like and Comment Counts
echo "6. Get All Posts with Like/Comment Counts:"
curl -X GET "$BASE_URL/api/post?page=1&limit=10" \
  -H "Content-Type: application/json"

echo -e "\n"

# 7. Get Posts by Category with Like and Comment Counts
echo "7. Get Posts by Category with Like/Comment Counts:"
curl -X GET "$BASE_URL/api/post/category/$CATEGORY_ID?page=1&limit=10" \
  -H "Content-Type: application/json"

echo -e "\n=== LOGIN COMMAND (to get JWT token) ===\n"
curl -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'

echo -e "\n\n=== INSTRUCTIONS ===\n"
echo "1. First run the login command to get your JWT token"
echo "2. Replace YOUR_JWT_TOKEN_HERE with the actual token"
echo "3. Replace POST_ID, COMMENT_ID, CATEGORY_ID with actual IDs"
echo "4. Run individual commands or the entire script"
