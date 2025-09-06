# Complete test: Login -> Set Preferences -> Get Personalized Content
Write-Host "🚀 Testing Complete Personalization Flow..." -ForegroundColor Green

# Step 1: Login
Write-Host "`n🔐 Step 1: Login..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "https://statusgo-jwa6.onrender.com/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"p@gmail.com","password":"123456"}'

if ($loginResponse.success) {
    Write-Host "✅ Login successful!" -ForegroundColor Green
    $token = $loginResponse.data.token
    
    # Step 2: Set Preferences
    Write-Host "`n🎯 Step 2: Setting preferences..." -ForegroundColor Yellow
    $preferencesResponse = Invoke-RestMethod -Uri "https://statusgo-jwa6.onrender.com/api/auth/set-preferences" -Method Post -ContentType "application/json" -Headers @{"Authorization"="Bearer $token"} -Body '{"categoryIds":[1,2,3]}'
    
    if ($preferencesResponse.success) {
        Write-Host "✅ Preferences set!" -ForegroundColor Green
        
        # Step 3: Get Personalized Posts
        Write-Host "`n📱 Step 3: Getting personalized posts..." -ForegroundColor Yellow
        try {
            $personalizedResponse = Invoke-RestMethod -Uri "https://statusgo-jwa6.onrender.com/api/posts/personalized" -Method Get -Headers @{"Authorization"="Bearer $token"}
            
            if ($personalizedResponse.success) {
                Write-Host "✅ Personalized posts retrieved!" -ForegroundColor Green
                Write-Host "Number of posts: $($personalizedResponse.data.Count)" -ForegroundColor Cyan
                
                if ($personalizedResponse.data.Count -gt 0) {
                    Write-Host "Sample posts:" -ForegroundColor Cyan
                    foreach ($post in $personalizedResponse.data | Select-Object -First 3) {
                        Write-Host "  - Post ID: $($post.id), Category: $($post.category.name)" -ForegroundColor White
                    }
                }
            }
        } catch {
            Write-Host "⚠️ Personalized posts endpoint might not be available yet" -ForegroundColor Yellow
        }
        
        # Step 4: Get Suggested Posts
        Write-Host "`n🔥 Step 4: Getting suggested posts..." -ForegroundColor Yellow
        try {
            $suggestedResponse = Invoke-RestMethod -Uri "https://statusgo-jwa6.onrender.com/api/posts/suggested" -Method Get -Headers @{"Authorization"="Bearer $token"}
            
            if ($suggestedResponse.success) {
                Write-Host "✅ Suggested posts retrieved!" -ForegroundColor Green
                Write-Host "Number of posts: $($suggestedResponse.data.Count)" -ForegroundColor Cyan
            }
        } catch {
            Write-Host "⚠️ Suggested posts endpoint might not be available yet" -ForegroundColor Yellow
        }
        
        # Step 5: Verify Preferences
        Write-Host "`n📋 Step 5: Checking current preferences..." -ForegroundColor Yellow
        $getPrefsResponse = Invoke-RestMethod -Uri "https://statusgo-jwa6.onrender.com/api/auth/get-preferences" -Method Get -Headers @{"Authorization"="Bearer $token"}
        
        if ($getPrefsResponse.success) {
            Write-Host "✅ Current preferences:" -ForegroundColor Green
            foreach ($pref in $getPrefsResponse.data.preferences) {
                Write-Host "  - $($pref.category.name) (Weight: $($pref.weight))" -ForegroundColor Cyan
            }
        }
        
        Write-Host "`n🎉 Personalization flow completed!" -ForegroundColor Green
        
    } else {
        Write-Host "❌ Failed to set preferences" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Login failed" -ForegroundColor Red
}
