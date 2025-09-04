# Simple test for preferences - step by step
Write-Host "🧪 Testing Preferences Step by Step..." -ForegroundColor Green

# Step 1: Login
Write-Host "Step 1: Login..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"p@gmail.com","password":"123456"}'

if ($loginResponse.success) {
    Write-Host "✅ Login Success!" -ForegroundColor Green
    $token = $loginResponse.data.token
    
    # Step 2: Test preferences endpoint
    Write-Host "Step 2: Testing preferences..." -ForegroundColor Yellow
    
    try {
        $preferencesResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/preferences" -Method Post -ContentType "application/json" -Headers @{"Authorization"="Bearer $token"} -Body '{"categoryIds":[1,2,3]}'
        
        if ($preferencesResponse.success) {
            Write-Host "✅ Preferences Success!" -ForegroundColor Green
            Write-Host "Message: $($preferencesResponse.message)" -ForegroundColor Cyan
        } else {
            Write-Host "❌ Preferences Failed: $($preferencesResponse.message)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Preferences Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails) {
            Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ Login Failed" -ForegroundColor Red
}
