# =============================================================================
# LIKE AND COMMENT API CURL COMMANDS
# =============================================================================

# Note: Replace YOUR_JWT_TOKEN with actual JWT token from login
# Note: Replace POST_ID with actual post ID
# Note: Replace COMMENT_ID with actual comment ID

$baseUrl = "http://localhost:3000"
$token = "YOUR_JWT_TOKEN_HERE"  # Replace with actual token
$postId = "1"  # Replace with actual post ID

Write-Host "=== LIKE FUNCTIONALITY ===" -ForegroundColor Green

# 1. Toggle Like/Unlike a Post (requires authentication)
Write-Host "`n1. Like/Unlike a Post:" -ForegroundColor Yellow
$likeCommand = @"
curl -X POST "$baseUrl/api/posts/$postId/like" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token"
"@
Write-Host $likeCommand
Write-Host ""

# 2. Get All Likes for a Post (no authentication required)
Write-Host "2. Get All Likes for a Post:" -ForegroundColor Yellow
$getLikesCommand = @"
curl -X GET "$baseUrl/api/posts/$postId/likes?page=1&limit=10" \
  -H "Content-Type: application/json"
"@
Write-Host $getLikesCommand
Write-Host ""

Write-Host "=== COMMENT FUNCTIONALITY ===" -ForegroundColor Green

# 3. Create a Comment (requires authentication)
Write-Host "`n3. Create a Comment:" -ForegroundColor Yellow
$createCommentCommand = @"
curl -X POST "$baseUrl/api/posts/$postId/comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{
    "content": "This is a great post! I really like it."
  }'
"@
Write-Host $createCommentCommand
Write-Host ""

# 4. Get All Comments for a Post (no authentication required)
Write-Host "4. Get All Comments for a Post:" -ForegroundColor Yellow
$getCommentsCommand = @"
curl -X GET "$baseUrl/api/posts/$postId/comments?page=1&limit=10" \
  -H "Content-Type: application/json"
"@
Write-Host $getCommentsCommand
Write-Host ""

# 5. Delete a Comment (requires authentication - only comment owner)
Write-Host "5. Delete a Comment:" -ForegroundColor Yellow
$commentId = "1"  # Replace with actual comment ID
$deleteCommentCommand = @"
curl -X DELETE "$baseUrl/api/posts/$postId/comments/$commentId" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token"
"@
Write-Host $deleteCommentCommand
Write-Host ""

Write-Host "=== GET POSTS WITH LIKE/COMMENT COUNTS ===" -ForegroundColor Green

# 6. Get All Posts with Like and Comment Counts
Write-Host "`n6. Get All Posts with Like/Comment Counts:" -ForegroundColor Yellow
$getAllPostsCommand = @"
curl -X GET "$baseUrl/api/post?page=1&limit=10" \
  -H "Content-Type: application/json"
"@
Write-Host $getAllPostsCommand
Write-Host ""

# 7. Get Posts by Category with Like and Comment Counts
Write-Host "7. Get Posts by Category with Like/Comment Counts:" -ForegroundColor Yellow
$categoryId = "1"  # Replace with actual category ID
$getPostsByCategoryCommand = @"
curl -X GET "$baseUrl/api/post/category/$categoryId?page=1&limit=10" \
  -H "Content-Type: application/json"
"@
Write-Host $getPostsByCategoryCommand
Write-Host ""

Write-Host "=== EXAMPLE WORKFLOW ===" -ForegroundColor Cyan
Write-Host "`nExample workflow to test complete functionality:" -ForegroundColor White
Write-Host "1. First login to get JWT token"
Write-Host "2. Use the token in the like/comment endpoints"
Write-Host "3. Create some comments"
Write-Host "4. Like/unlike posts"
Write-Host "5. Check the getAllPosts endpoint to see counts"
Write-Host ""

Write-Host "=== LOGIN COMMAND (to get JWT token) ===" -ForegroundColor Magenta
$loginCommand = @"
curl -X POST "$baseUrl/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
"@
Write-Host $loginCommand
Write-Host ""

Write-Host "=== RESPONSE EXAMPLES ===" -ForegroundColor Blue
Write-Host "`nExpected Response for Like Toggle:" -ForegroundColor White
Write-Host @"
{
  "success": true,
  "data": {
    "liked": true,
    "likeCount": 5
  },
  "message": "Post liked successfully",
  "statusCode": 200
}
"@

Write-Host "`nExpected Response for Get Posts with Counts:" -ForegroundColor White
Write-Host @"
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 1,
        "attachment": "cloudinary-url",
        "categoryId": 1,
        "createdAt": "2025-07-18T...",
        "updatedAt": "2025-07-18T...",
        "_count": {
          "likes": 5,
          "comments": 3
        },
        "category": {
          "id": 1,
          "name": "Category Name"
        }
      }
    ],
    "pagination": { ... }
  }
}
"@

Write-Host "`n=== NOTES ===" -ForegroundColor Red
Write-Host "- Replace YOUR_JWT_TOKEN_HERE with actual JWT token from login"
Write-Host "- Replace POST_ID with actual post ID (1, 2, 3, etc.)"
Write-Host "- Replace COMMENT_ID with actual comment ID for deletion"
Write-Host "- Like/Comment endpoints require authentication"
Write-Host "- Get endpoints are public (no authentication required)"
Write-Host "- Users can only delete their own comments"
Write-Host "- Like toggle: if not liked -> likes, if already liked -> unlikes"
