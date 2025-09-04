# Test login after fixing the hasSetPreferences error
Write-Host "🔐 Testing Login..." -ForegroundColor Yellow

$loginData = @{
    email = "p@gmail.com"
    password = "123456"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Headers $headers -Body $loginData
    
    if ($response.success) {
        Write-Host "✅ Login successful!" -ForegroundColor Green
        Write-Host "User ID: $($response.data.user.id)" -ForegroundColor Cyan
        Write-Host "Email: $($response.data.user.email)" -ForegroundColor Cyan
        Write-Host "Has Set Preferences: $($response.data.user.hasSetPreferences)" -ForegroundColor Cyan
        Write-Host "Token: $($response.data.token.Substring(0, 20))..." -ForegroundColor Cyan
    } else {
        Write-Host "❌ Login failed: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
