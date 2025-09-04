# Quick test to see if preferences endpoint works now
Write-Host "Testing preferences endpoint..." -ForegroundColor Green

# Login first
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"p@gmail.com","password":"123456"}'

if ($loginResponse.success) {
    $token = $loginResponse.data.token
    Write-Host "Login successful, testing preferences..." -ForegroundColor Green
    
    # Test GET preferences
    try {
        $getResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/preferences" -Method Get -Headers @{"Authorization"="Bearer $token"}
        Write-Host "✅ GET /api/preferences works!" -ForegroundColor Green
    } catch {
        Write-Host "❌ GET failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test POST preferences  
    try {
        $postResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/preferences" -Method Post -ContentType "application/json" -Headers @{"Authorization"="Bearer $token"} -Body '{"categoryIds":[1,2,3]}'
        Write-Host "✅ POST /api/preferences works!" -ForegroundColor Green
        Write-Host "Response: $($postResponse.message)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ POST failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Login failed" -ForegroundColor Red
}
