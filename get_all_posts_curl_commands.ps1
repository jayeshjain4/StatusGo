# PowerShell curl commands for getting all posts

# 1. Standard curl command (Windows PowerShell syntax)
$curl_get_all_posts = @"
curl -X GET http://localhost:3000/api/post `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
"@

Write-Host "Standard curl command for getting all posts:"
Write-Host $curl_get_all_posts
Write-Host "`n"

# 2. PowerShell native Invoke-RestMethod command
$ps_get_all_posts = @"
Invoke-RestMethod -Uri 'http://localhost:3000/api/post' `
  -Method Get `
  -Headers @{
      "Authorization" = "Bearer YOUR_TOKEN_HERE"
  }
"@

Write-Host "PowerShell native command for getting all posts:"
Write-Host $ps_get_all_posts
Write-Host "`n"

# 3. Curl command without authentication (if not required)
$curl_get_all_posts_no_auth = @"
curl -X GET http://localhost:3000/api/post
"@

Write-Host "Curl command without authentication (if not required):"
Write-Host $curl_get_all_posts_no_auth
Write-Host "`n"

Write-Host "Instructions:"
Write-Host "1. Replace 'YOUR_TOKEN_HERE' with the actual JWT token you received after login."
Write-Host "2. The API will return all posts in descending order by creation date."
Write-Host "3. Each post contains an 'attachment' field with the Cloudinary URL to the photo or video."
Write-Host "4. Run this command after you have created some posts to see them listed."
