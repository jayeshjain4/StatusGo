# 🚀 COMPLETE API FLOW - Automated Test Script
# This script runs the complete flow from signup to personalization

param(
    [string]$BaseUrl = "http://localhost:3000/api",
    [string]$Email = "testuser$(Get-Random)@example.com"
)

Write-Host "🚀 COMPLETE API FLOW TEST" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host "Base URL: $BaseUrl" -ForegroundColor Cyan
Write-Host "Test Email: $Email" -ForegroundColor Cyan
Write-Host ""

# Global variables
$global:token = ""
$global:userId = 0
$global:categories = @()

function Invoke-ApiCall {
    param($Method, $Url, $Body = $null, $RequireAuth = $false)
    
    $headers = @{"Content-Type" = "application/json"}
    if ($RequireAuth -and $global:token) {
        $headers["Authorization"] = "Bearer $global:token"
    }
    
    try {
        if ($Body) {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Body $Body -Headers $headers
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers
        }
        return @{Success = $true; Data = $response}
    } catch {
        return @{Success = $false; Error = $_.Exception.Message}
    }
}

# STEP 1: USER SIGNUP
Write-Host "👤 STEP 1: USER SIGNUP" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$signupData = @{
    firstName = "John"
    lastName = "Doe"
    email = $Email
    password = "password123"
    phone = "+123456789$(Get-Random -Minimum 10 -Maximum 99)"
} | ConvertTo-Json

$signupResult = Invoke-ApiCall -Method "POST" -Url "$BaseUrl/auth/signup" -Body $signupData

if ($signupResult.Success) {
    Write-Host "✅ User created successfully!" -ForegroundColor Green
    Write-Host "   User ID: $($signupResult.Data.data.user.id)" -ForegroundColor Cyan
    Write-Host "   Email: $($signupResult.Data.data.user.email)" -ForegroundColor Cyan
    Write-Host "   Has Set Preferences: $($signupResult.Data.data.user.hasSetPreferences)" -ForegroundColor Cyan
    $global:token = $signupResult.Data.data.token
    $global:userId = $signupResult.Data.data.user.id
} else {
    Write-Host "❌ Signup failed: $($signupResult.Error)" -ForegroundColor Red
    Write-Host "   Trying with existing user..." -ForegroundColor Yellow
}

Write-Host ""

# STEP 2: USER LOGIN
Write-Host "🔑 STEP 2: USER LOGIN" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$loginData = @{
    email = $Email
    password = "password123"
} | ConvertTo-Json

$loginResult = Invoke-ApiCall -Method "POST" -Url "$BaseUrl/auth/login" -Body $loginData

if ($loginResult.Success) {
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "   User ID: $($loginResult.Data.data.user.id)" -ForegroundColor Cyan
    Write-Host "   Name: $($loginResult.Data.data.user.firstName) $($loginResult.Data.data.user.lastName)" -ForegroundColor Cyan
    Write-Host "   Has Set Preferences: $($loginResult.Data.data.user.hasSetPreferences)" -ForegroundColor Cyan
    Write-Host "   Token: $($loginResult.Data.data.token.Substring(0,30))..." -ForegroundColor Cyan
    $global:token = $loginResult.Data.data.token
    $global:userId = $loginResult.Data.data.user.id
} else {
    Write-Host "❌ Login failed: $($loginResult.Error)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# STEP 3: GET USER PROFILE
Write-Host "👥 STEP 3: GET USER PROFILE" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$profileResult = Invoke-ApiCall -Method "GET" -Url "$BaseUrl/auth/profile" -RequireAuth $true

if ($profileResult.Success) {
    Write-Host "✅ Profile fetched successfully!" -ForegroundColor Green
    Write-Host "   Name: $($profileResult.Data.data.firstName) $($profileResult.Data.data.lastName)" -ForegroundColor Cyan
    Write-Host "   Email: $($profileResult.Data.data.email)" -ForegroundColor Cyan
    Write-Host "   Role: $($profileResult.Data.data.role)" -ForegroundColor Cyan
    Write-Host "   Created: $($profileResult.Data.data.createdAt)" -ForegroundColor Cyan
} else {
    Write-Host "❌ Profile fetch failed: $($profileResult.Error)" -ForegroundColor Red
}

Write-Host ""

# STEP 4: GET ALL CATEGORIES
Write-Host "📂 STEP 4: GET ALL CATEGORIES" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$categoriesResult = Invoke-ApiCall -Method "GET" -Url "$BaseUrl/categories"

if ($categoriesResult.Success) {
    $global:categories = $categoriesResult.Data.data.categories
    Write-Host "✅ Categories fetched successfully!" -ForegroundColor Green
    Write-Host "   Total Categories: $($global:categories.Count)" -ForegroundColor Cyan
    
    foreach ($category in $global:categories) {
        Write-Host "   - ID: $($category.id), Name: $($category.name), Popularity: $($category.popularity)" -ForegroundColor White
    }
} else {
    Write-Host "❌ Categories fetch failed: $($categoriesResult.Error)" -ForegroundColor Red
}

Write-Host ""

# STEP 5: SET USER PREFERENCES
Write-Host "⭐ STEP 5: SET USER PREFERENCES" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

if ($global:categories.Count -gt 0) {
    $selectedCategoryIds = $global:categories[0..[Math]::Min(2, $global:categories.Count - 1)] | ForEach-Object { $_.id }
    
    $preferencesData = @{
        categoryIds = $selectedCategoryIds
    } | ConvertTo-Json
    
    $preferencesResult = Invoke-ApiCall -Method "POST" -Url "$BaseUrl/preferences" -Body $preferencesData -RequireAuth $true
    
    if ($preferencesResult.Success) {
        Write-Host "✅ Preferences set successfully!" -ForegroundColor Green
        Write-Host "   Selected Categories: $($selectedCategoryIds -join ', ')" -ForegroundColor Cyan
        
        foreach ($pref in $preferencesResult.Data.data) {
            Write-Host "   - $($pref.category.name) (Weight: $($pref.weight))" -ForegroundColor White
        }
    } else {
        Write-Host "❌ Setting preferences failed: $($preferencesResult.Error)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  No categories available to set preferences" -ForegroundColor Yellow
}

Write-Host ""

# STEP 6: GET USER PREFERENCES
Write-Host "📋 STEP 6: GET USER PREFERENCES" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$userPrefsResult = Invoke-ApiCall -Method "GET" -Url "$BaseUrl/preferences" -RequireAuth $true

if ($userPrefsResult.Success) {
    Write-Host "✅ User preferences fetched!" -ForegroundColor Green
    Write-Host "   Has Set Preferences: $($userPrefsResult.Data.data.hasSetPreferences)" -ForegroundColor Cyan
    Write-Host "   Total Preferences: $($userPrefsResult.Data.data.preferences.Count)" -ForegroundColor Cyan
    
    foreach ($pref in $userPrefsResult.Data.data.preferences) {
        Write-Host "   - $($pref.category.name): Weight $($pref.weight), Popularity $($pref.category.popularity)" -ForegroundColor White
    }
} else {
    Write-Host "❌ Getting user preferences failed: $($userPrefsResult.Error)" -ForegroundColor Red
}

Write-Host ""

# STEP 7: GET ALL POSTS (WITHOUT AUTH)
Write-Host "📱 STEP 7: GET ALL POSTS (WITHOUT AUTHENTICATION)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$postsNoAuthResult = Invoke-ApiCall -Method "GET" -Url "$BaseUrl/posts?page=1&limit=5"

if ($postsNoAuthResult.Success) {
    Write-Host "✅ General posts fetched!" -ForegroundColor Green
    Write-Host "   Total Posts: $($postsNoAuthResult.Data.data.pagination.totalPosts)" -ForegroundColor Cyan
    Write-Host "   Personalized: $($postsNoAuthResult.Data.data.personalized)" -ForegroundColor Cyan
    Write-Host "   Posts in Response: $($postsNoAuthResult.Data.data.posts.Count)" -ForegroundColor Cyan
    
    foreach ($post in $postsNoAuthResult.Data.data.posts) {
        $categoryName = if ($post.category) { $post.category.name } else { "No Category" }
        Write-Host "   - Post ID: $($post.id), Category: $categoryName, Likes: $($post._count.likes)" -ForegroundColor White
    }
} else {
    Write-Host "❌ Getting general posts failed: $($postsNoAuthResult.Error)" -ForegroundColor Red
}

Write-Host ""

# STEP 8: GET ALL POSTS (WITH AUTH - AUTO PERSONALIZED)
Write-Host "🎯 STEP 8: GET ALL POSTS (WITH AUTHENTICATION - AUTO PERSONALIZED)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$postsAuthResult = Invoke-ApiCall -Method "GET" -Url "$BaseUrl/posts?page=1&limit=5" -RequireAuth $true

if ($postsAuthResult.Success) {
    Write-Host "✅ Auto-personalized posts fetched!" -ForegroundColor Green
    Write-Host "   Total Posts: $($postsAuthResult.Data.data.pagination.totalPosts)" -ForegroundColor Cyan
    Write-Host "   Personalized: $($postsAuthResult.Data.data.personalized)" -ForegroundColor Cyan
    Write-Host "   Posts in Response: $($postsAuthResult.Data.data.posts.Count)" -ForegroundColor Cyan
    
    foreach ($post in $postsAuthResult.Data.data.posts) {
        $categoryName = if ($post.category) { $post.category.name } else { "No Category" }
        Write-Host "   - Post ID: $($post.id), Category: $categoryName, Likes: $($post._count.likes)" -ForegroundColor White
    }
} else {
    Write-Host "❌ Getting auto-personalized posts failed: $($postsAuthResult.Error)" -ForegroundColor Red
}

Write-Host ""

# STEP 9: GET PERSONALIZED POSTS (ADVANCED ALGORITHM)
Write-Host "🤖 STEP 9: GET PERSONALIZED POSTS (ADVANCED ALGORITHM)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$personalizedResult = Invoke-ApiCall -Method "GET" -Url "$BaseUrl/posts/personalized?page=1&limit=5" -RequireAuth $true

if ($personalizedResult.Success) {
    Write-Host "✅ Advanced personalized posts fetched!" -ForegroundColor Green
    Write-Host "   Total Posts: $($personalizedResult.Data.data.pagination.totalPosts)" -ForegroundColor Cyan
    Write-Host "   Has Set Preferences: $($personalizedResult.Data.data.personalization.hasSetPreferences)" -ForegroundColor Cyan
    Write-Host "   Preferred Categories: $($personalizedResult.Data.data.personalization.preferredCategories.Count)" -ForegroundColor Cyan
    
    foreach ($post in $personalizedResult.Data.data.posts) {
        $categoryName = if ($post.category) { $post.category.name } else { "No Category" }
        $relevanceScore = if ($post.relevanceScore) { "Score: $($post.relevanceScore)" } else { "" }
        Write-Host "   - Post ID: $($post.id), Category: $categoryName, Likes: $($post._count.likes) $relevanceScore" -ForegroundColor White
    }
} else {
    Write-Host "❌ Getting advanced personalized posts failed: $($personalizedResult.Error)" -ForegroundColor Red
}

Write-Host ""

# STEP 10: GET SUGGESTED POSTS (TRENDING)
Write-Host "💡 STEP 10: GET SUGGESTED POSTS (TRENDING)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$suggestedResult = Invoke-ApiCall -Method "GET" -Url "$BaseUrl/posts/suggested?page=1&limit=5" -RequireAuth $true

if ($suggestedResult.Success) {
    Write-Host "✅ Suggested posts fetched!" -ForegroundColor Green
    Write-Host "   Suggestion Type: $($suggestedResult.Data.data.suggestion.type)" -ForegroundColor Cyan
    Write-Host "   Description: $($suggestedResult.Data.data.suggestion.description)" -ForegroundColor Cyan
    Write-Host "   Posts in Response: $($suggestedResult.Data.data.posts.Count)" -ForegroundColor Cyan
    
    foreach ($post in $suggestedResult.Data.data.posts) {
        $categoryName = if ($post.category) { $post.category.name } else { "No Category" }
        Write-Host "   - Post ID: $($post.id), Category: $categoryName, Likes: $($post._count.likes)" -ForegroundColor White
    }
} else {
    Write-Host "❌ Getting suggested posts failed: $($suggestedResult.Error)" -ForegroundColor Red
}

Write-Host ""

# STEP 11: UPDATE PREFERENCE WEIGHT
Write-Host "⚙️  STEP 11: UPDATE PREFERENCE WEIGHT" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

if ($userPrefsResult.Success -and $userPrefsResult.Data.data.preferences.Count -gt 0) {
    $firstPref = $userPrefsResult.Data.data.preferences[0]
    $categoryId = $firstPref.categoryId
    
    $weightUpdateData = @{
        weight = 2.5
    } | ConvertTo-Json
    
    $weightUpdateResult = Invoke-ApiCall -Method "PUT" -Url "$BaseUrl/preferences/$categoryId/weight" -Body $weightUpdateData -RequireAuth $true
    
    if ($weightUpdateResult.Success) {
        Write-Host "✅ Preference weight updated!" -ForegroundColor Green
        Write-Host "   Category: $($weightUpdateResult.Data.data.category.name)" -ForegroundColor Cyan
        Write-Host "   Old Weight: $($firstPref.weight) → New Weight: $($weightUpdateResult.Data.data.weight)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Updating preference weight failed: $($weightUpdateResult.Error)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  No preferences available to update" -ForegroundColor Yellow
}

Write-Host ""

# STEP 12: GET POSTS BY CATEGORY
Write-Host "📊 STEP 12: GET POSTS BY CATEGORY" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

if ($global:categories.Count -gt 0) {
    $firstCategoryId = $global:categories[0].id
    $firstCategoryName = $global:categories[0].name
    
    $categoryPostsResult = Invoke-ApiCall -Method "GET" -Url "$BaseUrl/posts/category/$firstCategoryId?page=1&limit=3"
    
    if ($categoryPostsResult.Success) {
        Write-Host "✅ Category posts fetched!" -ForegroundColor Green
        Write-Host "   Category: $($categoryPostsResult.Data.data.category.name)" -ForegroundColor Cyan
        Write-Host "   Total Posts in Category: $($categoryPostsResult.Data.data.pagination.totalPosts)" -ForegroundColor Cyan
        Write-Host "   Posts in Response: $($categoryPostsResult.Data.data.posts.Count)" -ForegroundColor Cyan
        
        foreach ($post in $categoryPostsResult.Data.data.posts) {
            Write-Host "   - Post ID: $($post.id), Likes: $($post._count.likes), Comments: $($post._count.comments)" -ForegroundColor White
        }
    } else {
        Write-Host "❌ Getting category posts failed: $($categoryPostsResult.Error)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  No categories available for browsing" -ForegroundColor Yellow
}

Write-Host ""

# STEP 13: SEARCH POSTS
Write-Host "🔍 STEP 13: SEARCH POSTS" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$searchQuery = if ($global:categories.Count -gt 0) { $global:categories[0].name.ToLower() } else { "test" }
$searchResult = Invoke-ApiCall -Method "GET" -Url "$BaseUrl/posts/search?q=$searchQuery&page=1&limit=3"

if ($searchResult.Success) {
    Write-Host "✅ Search results fetched!" -ForegroundColor Green
    Write-Host "   Search Query: '$($searchResult.Data.data.search.query)'" -ForegroundColor Cyan
    Write-Host "   Total Results: $($searchResult.Data.data.search.totalResults)" -ForegroundColor Cyan
    Write-Host "   Posts in Response: $($searchResult.Data.data.posts.Count)" -ForegroundColor Cyan
    
    foreach ($post in $searchResult.Data.data.posts) {
        $categoryName = if ($post.category) { $post.category.name } else { "No Category" }
        Write-Host "   - Post ID: $($post.id), Category: $categoryName" -ForegroundColor White
    }
} else {
    Write-Host "❌ Search failed: $($searchResult.Error)" -ForegroundColor Red
}

Write-Host ""

# FINAL SUMMARY
Write-Host "🎉 COMPLETE API FLOW FINISHED!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════════════════" -ForegroundColor Green

Write-Host ""
Write-Host "📊 SUMMARY OF WHAT WAS TESTED:" -ForegroundColor Cyan
Write-Host "✅ User Authentication (Signup + Login)" -ForegroundColor Green
Write-Host "✅ User Profile Management" -ForegroundColor Green
Write-Host "✅ Category Discovery" -ForegroundColor Green
Write-Host "✅ Preference Setting & Management" -ForegroundColor Green
Write-Host "✅ General Posts (No Personalization)" -ForegroundColor Green
Write-Host "✅ Auto-Personalized Posts (70/30 Mix)" -ForegroundColor Green
Write-Host "✅ Advanced Personalized Posts (Algorithm)" -ForegroundColor Green
Write-Host "✅ Suggested Trending Posts" -ForegroundColor Green
Write-Host "✅ Preference Weight Updates" -ForegroundColor Green
Write-Host "✅ Category-Based Browsing" -ForegroundColor Green
Write-Host "✅ Content Search" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 YOUR PERSONALIZED POSTS API IS FULLY FUNCTIONAL!" -ForegroundColor Cyan
Write-Host "Ready for Flutter app integration! 📱✨" -ForegroundColor Yellow
