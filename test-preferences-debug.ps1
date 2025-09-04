# Test preferences endpoint step by step
Write-Host "🧪 Testing Preferences Endpoint..." -ForegroundColor Green

# Step 1: Login to get a valid token
Write-Host "`n🔐 Step 1: Getting valid JWT token..." -ForegroundColor Yellow

$loginData = @{
    email = "p@gmail.com"
    password = "123456"
} | ConvertTo-Json

$loginHeaders = @{
    "Content-Type" = "application/json"
}

try {
    Write-Host "Attempting login..." -ForegroundColor Cyan
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Headers $loginHeaders -Body $loginData
    
    if ($loginResponse.success) {
        Write-Host "✅ Login successful!" -ForegroundColor Green
        $token = $loginResponse.data.token
        Write-Host "Token: $($token.Substring(0, 50))..." -ForegroundColor Cyan
        
        # Step 2: Test preferences endpoint
        Write-Host "`n🎯 Step 2: Testing preferences endpoint..." -ForegroundColor Yellow
        
        $preferencesHeaders = @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $token"
        }
        
        $preferencesData = @{
            categoryIds = @(1, 2, 3)
        } | ConvertTo-Json
        
        Write-Host "Making POST request to: http://localhost:3000/api/preferences" -ForegroundColor Cyan
        Write-Host "Headers: Authorization: Bearer ..." -ForegroundColor Cyan
        Write-Host "Body: $preferencesData" -ForegroundColor Cyan
        
        $preferencesResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/preferences" -Method Post -Headers $preferencesHeaders -Body $preferencesData
        
        if ($preferencesResponse.success) {
            Write-Host "✅ Preferences set successfully!" -ForegroundColor Green
            Write-Host "Response: $($preferencesResponse | ConvertTo-Json -Depth 3)" -ForegroundColor White
        } else {
            Write-Host "❌ Preferences failed: $($preferencesResponse.message)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "❌ Login failed: $($loginResponse.message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error occurred:" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $responseStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($responseStream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}
