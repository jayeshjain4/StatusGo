# Test the new auth preferences endpoints locally
Write-Host "🧪 Testing Local Auth Preferences Endpoints..." -ForegroundColor Green

# Step 1: Login to get token
Write-Host "`n🔐 Step 1: Login..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"p@gmail.com","password":"123456"}'
    
    if ($loginResponse.success) {
        Write-Host "✅ Login successful!" -ForegroundColor Green
        $token = $loginResponse.data.token
        Write-Host "Token: $($token.Substring(0, 30))..." -ForegroundColor Cyan
        
        # Step 2: Set preferences
        Write-Host "`n🎯 Step 2: Setting preferences..." -ForegroundColor Yellow
        $preferencesResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/set-preferences" -Method Post -ContentType "application/json" -Headers @{"Authorization"="Bearer $token"} -Body '{"categoryIds":[1,2,3,4]}'
        
        if ($preferencesResponse.success) {
            Write-Host "✅ Preferences set successfully!" -ForegroundColor Green
            Write-Host "Message: $($preferencesResponse.message)" -ForegroundColor Cyan
            Write-Host "Preferences count: $($preferencesResponse.data.Count)" -ForegroundColor Cyan
            
            # Step 3: Get preferences
            Write-Host "`n📋 Step 3: Getting preferences..." -ForegroundColor Yellow
            $getResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/get-preferences" -Method Get -Headers @{"Authorization"="Bearer $token"}
            
            if ($getResponse.success) {
                Write-Host "✅ Get preferences successful!" -ForegroundColor Green
                Write-Host "Has Set Preferences: $($getResponse.data.hasSetPreferences)" -ForegroundColor Cyan
                Write-Host "Preferences count: $($getResponse.data.preferences.Count)" -ForegroundColor Cyan
                
                Write-Host "`n🎉 All tests passed! Ready for deployment!" -ForegroundColor Green
            } else {
                Write-Host "❌ Get preferences failed: $($getResponse.message)" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Set preferences failed: $($preferencesResponse.message)" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Login failed: $($loginResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure the server is running on http://localhost:3000" -ForegroundColor Yellow
}
