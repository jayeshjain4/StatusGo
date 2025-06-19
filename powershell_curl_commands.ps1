# PowerShell Curl Commands for BillEasy API

# 1. Signup with all fields (profileImage, phone)
# Replace the path to your image with an actual one
# The -F option in curl is for form-data which allows file uploads
$command_signup_all = @"
curl -X POST http://localhost:3000/api/auth/signup `
  -F "firstName=John" `
  -F "lastName=Doe" `
  -F "email=john.doe@example.com" `
  -F "phone=1234567890" `
  -F "password=password123" `
  -F "profileImage=@C:\path\to\your\image.jpg"
"@
Write-Host "Signup with all fields:"
Write-Host $command_signup_all
Write-Host "`n"

# 2. Signup without phone (just email)
$command_signup_no_phone = @"
curl -X POST http://localhost:3000/api/auth/signup `
  -F "firstName=Jane" `
  -F "lastName=Smith" `
  -F "email=jane.smith@example.com" `
  -F "password=password123" `
  -F "profileImage=@C:\path\to\your\image.jpg"
"@
Write-Host "Signup without phone:"
Write-Host $command_signup_no_phone
Write-Host "`n"

# 3. Signup without profileImage
$command_signup_no_image = @"
curl -X POST http://localhost:3000/api/auth/signup `
  -F "firstName=Mike" `
  -F "lastName=Johnson" `
  -F "email=mike.johnson@example.com" `
  -F "phone=9876543210" `
  -F "password=password123"
"@
Write-Host "Signup without profile image:"
Write-Host $command_signup_no_image
Write-Host "`n"

# 4. Signup without both phone and profileImage (minimal required fields)
$command_signup_minimal = @"
curl -X POST http://localhost:3000/api/auth/signup `
  -F "firstName=Bob" `
  -F "lastName=Brown" `
  -F "email=bob.brown@example.com" `
  -F "password=password123"
"@
Write-Host "Signup with minimal fields:"
Write-Host $command_signup_minimal
Write-Host "`n"

# 5. Login with email (curl syntax)
$command_login = @"
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"jane.smith@example.com\",\"password\":\"password123\"}'
"@
Write-Host "Login with email (curl):"
Write-Host $command_login
Write-Host "`n"

# 5b. Login with email (PowerShell Invoke-RestMethod)
$loginData = @{
    email = "jane.smith@example.com"
    password = "password123"
} | ConvertTo-Json

$command_login_ps = @"
Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' `
  -Method Post `
  -ContentType 'application/json' `
  -Body '$($loginData)'
"@
Write-Host "Login with email (PowerShell):"
Write-Host $command_login_ps
Write-Host "`n"

# 7. Create Post (with Bearer token authentication)
$command_create_post = @"
curl -X POST http://localhost:3000/api/posts `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -F "attachment=@C:\path\to\your\post_image.jpg" `
  -F "caption=My first post"
"@
Write-Host "Create post:"
Write-Host $command_create_post
Write-Host "`n"

# 8. Get all posts
$command_get_posts = @"
curl -X GET http://localhost:3000/api/posts `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
"@
Write-Host "Get all posts:"
Write-Host $command_get_posts
Write-Host "`n"

# Instructions
Write-Host "Instructions:"
Write-Host "1. Replace file paths with actual paths to your images on your system."

Write-Host "2. Replace 'YOUR_TOKEN_HERE' with the actual JWT token received after login."
Write-Host "3. Make sure the server is running on port 3000 before executing these commands."
Write-Host "4. In each case, the curl command returns a JSON response with user data and token (for authentication endpoints)."
Write-Host "`n"
