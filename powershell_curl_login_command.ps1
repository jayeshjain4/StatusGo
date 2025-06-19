# PowerShell curl command for login with email and password

$loginData = @{
    email = "user@example.com"
    password = "password123"
} | ConvertTo-Json

$loginCommand = @"
# Login API call
Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' `
  -Method Post `
  -ContentType 'application/json' `
  -Body '$($loginData)'
"@

Write-Host "Login command:"
Write-Host $loginCommand
