# Test all endpoints to debug the preferences issue
Write-Host "🔍 Debugging API endpoints..." -ForegroundColor Green

# Test basic server
Write-Host "`n1. Testing server health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -ErrorAction Stop
    Write-Host "✅ Server responding" -ForegroundColor Green
} catch {
    Write-Host "❌ Server not responding: $($_.Exception.Message)" -ForegroundColor Red
}

# Test login endpoint
Write-Host "`n2. Testing login endpoint..." -ForegroundColor Yellow
try {
    $loginData = '{"email":"p@gmail.com","password":"123456"}'
    $loginHeaders = @{"Content-Type" = "application/json"}
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Headers $loginHeaders -Body $loginData -ErrorAction Stop
    
    if ($loginResponse.success) {
        Write-Host "✅ Login successful" -ForegroundColor Green
        $token = $loginResponse.data.token
        Write-Host "Token: $($token.Substring(0, 30))..." -ForegroundColor Cyan
        
        # Test preferences endpoint
        Write-Host "`n3. Testing preferences endpoint..." -ForegroundColor Yellow
        try {
            $preferencesHeaders = @{
                "Content-Type" = "application/json"
                "Authorization" = "Bearer $token"
            }
            
            $preferencesData = '{"categoryIds":[1,2,3]}'
            
            Write-Host "Making request to: http://localhost:3000/api/preferences" -ForegroundColor Cyan
            Write-Host "With Authorization header" -ForegroundColor Cyan
            
            $preferencesResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/preferences" -Method Post -Headers $preferencesHeaders -Body $preferencesData -ErrorAction Stop
            
            Write-Host "✅ Preferences endpoint working!" -ForegroundColor Green
            Write-Host "Response: $($preferencesResponse.message)" -ForegroundColor White
            
        } catch {
            Write-Host "❌ Preferences endpoint failed:" -ForegroundColor Red
            Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
            
            # Try to get more details
            if ($_.Exception.Response) {
                $statusCode = $_.Exception.Response.StatusCode
                Write-Host "Status Code: $statusCode" -ForegroundColor Red
            }
        }
        
    } else {
        Write-Host "❌ Login failed: $($loginResponse.message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Login endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test other endpoints to see what's working
Write-Host "`n4. Testing other endpoints..." -ForegroundColor Yellow
try {
    $categoriesResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/categories/get-allCategories" -Method Get -Headers @{"Authorization" = "Bearer dummy"} -ErrorAction SilentlyContinue
    Write-Host "Categories endpoint: $($categoriesResponse.StatusCode)" -ForegroundColor Cyan
} catch {
    Write-Host "Categories endpoint: Failed" -ForegroundColor Red
}

Write-Host "`n📋 Debug Summary:" -ForegroundColor Magenta
Write-Host "- Server: Running on port 3000" -ForegroundColor White
Write-Host "- Login: Should work if user exists" -ForegroundColor White
Write-Host "- Preferences: Testing with valid token" -ForegroundColor White
