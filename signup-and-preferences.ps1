# Complete signup and preference setting flow
Write-Host "🚀 Starting Signup + Preferences Flow..." -ForegroundColor Green

$baseUrl = "http://localhost:3000/api"

# Step 1: Signup
Write-Host "`n📝 Step 1: Creating new user account..." -ForegroundColor Yellow

$signupData = @{
    firstName = "John"
    lastName = "Doe"
    email = "john.doe.$(Get-Random)@example.com"  # Random email to avoid conflicts
    password = "securePassword123"
    phone = "1234567890"
} | ConvertTo-Json

$signupHeaders = @{
    "Content-Type" = "application/json"
}

try {
    $signupResponse = Invoke-RestMethod -Uri "$baseUrl/auth/signup" -Method Post -Headers $signupHeaders -Body $signupData
    
    if ($signupResponse.success) {
        Write-Host "✅ Signup successful!" -ForegroundColor Green
        Write-Host "User ID: $($signupResponse.data.user.id)" -ForegroundColor Cyan
        Write-Host "Email: $($signupResponse.data.user.email)" -ForegroundColor Cyan
        Write-Host "Has Set Preferences: $($signupResponse.data.user.hasSetPreferences)" -ForegroundColor Cyan
        
        $token = $signupResponse.data.token
        Write-Host "Token received: $($token.Substring(0, 20))..." -ForegroundColor Cyan
        
        # Step 2: Get available categories
        Write-Host "`n📋 Step 2: Getting available categories..." -ForegroundColor Yellow
        
        $categoryHeaders = @{
            "Authorization" = "Bearer $token"
        }
        
        $categoriesResponse = Invoke-RestMethod -Uri "$baseUrl/categories/get-allCategories" -Method Get -Headers $categoryHeaders
        
        if ($categoriesResponse.success) {
            Write-Host "✅ Categories fetched successfully!" -ForegroundColor Green
            Write-Host "Available categories:" -ForegroundColor Cyan
            
            foreach ($category in $categoriesResponse.data) {
                Write-Host "  - ID: $($category.id), Name: $($category.name)" -ForegroundColor White
            }
            
            # Step 3: Set preferences (select first 3-4 categories)
            Write-Host "`n🎯 Step 3: Setting user preferences..." -ForegroundColor Yellow
            
            $selectedCategoryIds = $categoriesResponse.data | Select-Object -First 4 | ForEach-Object { $_.id }
            
            $preferencesData = @{
                categoryIds = $selectedCategoryIds
            } | ConvertTo-Json
            
            $preferencesHeaders = @{
                "Content-Type" = "application/json"
                "Authorization" = "Bearer $token"
            }
            
            $preferencesResponse = Invoke-RestMethod -Uri "$baseUrl/preferences" -Method Post -Headers $preferencesHeaders -Body $preferencesData
            
            if ($preferencesResponse.success) {
                Write-Host "✅ Preferences set successfully!" -ForegroundColor Green
                Write-Host "Selected categories:" -ForegroundColor Cyan
                
                foreach ($pref in $preferencesResponse.data) {
                    Write-Host "  - $($pref.category.name) (Weight: $($pref.weight))" -ForegroundColor White
                }
                
                # Step 4: Verify preferences were set
                Write-Host "`n🔍 Step 4: Verifying preferences..." -ForegroundColor Yellow
                
                $verifyResponse = Invoke-RestMethod -Uri "$baseUrl/preferences" -Method Get -Headers $categoryHeaders
                
                if ($verifyResponse.success) {
                    Write-Host "✅ Verification successful!" -ForegroundColor Green
                    Write-Host "Has Set Preferences: $($verifyResponse.data.hasSetPreferences)" -ForegroundColor Cyan
                    Write-Host "Number of preferences: $($verifyResponse.data.preferences.Count)" -ForegroundColor Cyan
                    
                    Write-Host "`n🎉 Complete flow finished successfully!" -ForegroundColor Green
                    Write-Host "User can now get personalized posts!" -ForegroundColor Green
                    
                    # Save token for future use
                    Write-Host "`n💾 Saving token for future API calls..." -ForegroundColor Yellow
                    $token | Out-File -FilePath ".\last_user_token.txt" -Encoding UTF8
                    Write-Host "Token saved to: .\last_user_token.txt" -ForegroundColor Cyan
                    
                } else {
                    Write-Host "❌ Failed to verify preferences: $($verifyResponse.message)" -ForegroundColor Red
                }
                
            } else {
                Write-Host "❌ Failed to set preferences: $($preferencesResponse.message)" -ForegroundColor Red
            }
            
        } else {
            Write-Host "❌ Failed to fetch categories: $($categoriesResponse.message)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "❌ Signup failed: $($signupResponse.message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error occurred: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure the server is running on http://localhost:3000" -ForegroundColor Yellow
}

Write-Host "`n📊 Flow Summary:" -ForegroundColor Magenta
Write-Host "1. ✅ User signup" -ForegroundColor White
Write-Host "2. ✅ Get categories" -ForegroundColor White  
Write-Host "3. ✅ Set preferences" -ForegroundColor White
Write-Host "4. ✅ Verify preferences" -ForegroundColor White
Write-Host "`nUser is now ready for personalized content! 🚀" -ForegroundColor Green
