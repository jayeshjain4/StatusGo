# PowerShell curl commands for uploading posts (photo/video)

# 1. Standard curl command for uploading an image post (Windows PowerShell syntax)
$curl_upload_image = @"
curl -X POST http://localhost:3000/api/post `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -F "attachment=@C:\path\to\your\image.jpg"
"@

Write-Host "Upload image post with curl:"
Write-Host $curl_upload_image
Write-Host "`n"

# 2. Standard curl command for uploading a video post
$curl_upload_video = @"
curl -X POST http://localhost:3000/api/post `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -F "attachment=@C:\path\to\your\video.mp4"
"@

Write-Host "Upload video post with curl:"
Write-Host $curl_upload_video
Write-Host "`n"

# 3. PowerShell native command for uploading an image post
$ps_upload_image = @"
Invoke-RestMethod -Uri 'http://localhost:3000/api/post' `
  -Method Post `
  -Headers @{
      "Authorization" = "Bearer YOUR_TOKEN_HERE"
  } `
  -Form @{
      attachment = Get-Item -Path "C:\path\to\your\image.jpg"
  }
"@

Write-Host "Upload image post with PowerShell Invoke-RestMethod:"
Write-Host $ps_upload_image
Write-Host "`n"

# 4. PowerShell native command for uploading a video post
$ps_upload_video = @"
Invoke-RestMethod -Uri 'http://localhost:3000/api/post' `
  -Method Post `
  -Headers @{
      "Authorization" = "Bearer YOUR_TOKEN_HERE"
  } `
  -Form @{
      attachment = Get-Item -Path "C:\path\to\your\video.mp4"
  }
"@

Write-Host "Upload video post with PowerShell Invoke-RestMethod:"
Write-Host $ps_upload_video
Write-Host "`n"

# 5. Example with actual file path - Replace with your path
$example_with_path = @"
# Example with actual Windows file path (replace with your file path)
curl -X POST http://localhost:3000/api/post `
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." `
  -F "attachment=@C:\Users\YourUsername\Pictures\sample_post.jpg"
"@

Write-Host "Example with specified file path (edit to match your system):"
Write-Host $example_with_path
Write-Host "`n"

Write-Host "Instructions:"
Write-Host "1. Replace 'YOUR_TOKEN_HERE' with the actual JWT token you received after login."
Write-Host "2. Replace the file paths with actual paths to your images or videos."
Write-Host "3. Supported file types are images (jpg, png, gif, etc.) and videos (mp4, mov, etc.)."
Write-Host "4. Maximum file size for uploads is 50MB."
Write-Host "5. The API will return the created post object with a Cloudinary URL if successful."
