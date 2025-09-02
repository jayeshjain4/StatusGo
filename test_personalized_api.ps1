# Personalized Posts API - PowerShell Testing Script

# Base URL
$baseUrl = "http://localhost:3000/api"

# Step 1: Login to get token (update with your credentials)
Write-Host "=== Step 1: Login ===" -ForegroundColor Green
$loginData = @{
    email = "user@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginData -ContentType "application/json"
    $token = $loginResponse.data.token
    $hasSetPreferences = $loginResponse.data.user.hasSetPreferences
    
    Write-Host "Login successful!" -ForegroundColor Green
    Write-Host "User ID: $($loginResponse.data.user.id)"
    Write-Host "Has Set Preferences: $hasSetPreferences"
    Write-Host "Token: $($token.Substring(0,20))..." -ForegroundColor Yellow
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Headers for authenticated requests
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "`n=== Step 2: Get Available Categories ===" -ForegroundColor Green
try {
    $categoriesResponse = Invoke-RestMethod -Uri "$baseUrl/categories" -Method Get
    $categories = $categoriesResponse.data.categories
    
    Write-Host "Available Categories:" -ForegroundColor Yellow
    foreach ($category in $categories) {
        Write-Host "  - ID: $($category.id), Name: $($category.name), Popularity: $($category.popularity)"
    }
} catch {
    Write-Host "Failed to get categories: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Set preferences if not already set
if (-not $hasSetPreferences) {
    Write-Host "`n=== Step 3: Setting User Preferences ===" -ForegroundColor Green
    
    # Select first 3 categories as preferences
    $selectedCategoryIds = $categories[0..2] | ForEach-Object { $_.id }
    $preferencesData = @{
        categoryIds = $selectedCategoryIds
    } | ConvertTo-Json
    
    try {
        $preferencesResponse = Invoke-RestMethod -Uri "$baseUrl/preferences" -Method Post -Body $preferencesData -Headers $headers
        Write-Host "Preferences set successfully!" -ForegroundColor Green
        Write-Host "Selected Categories: $($selectedCategoryIds -join ', ')"
    } catch {
        Write-Host "Failed to set preferences: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "`n=== Step 3: User already has preferences set ===" -ForegroundColor Yellow
}

# Step 4: Get user preferences
Write-Host "`n=== Step 4: Get User Preferences ===" -ForegroundColor Green
try {
    $userPreferencesResponse = Invoke-RestMethod -Uri "$baseUrl/preferences" -Method Get -Headers $headers
    $userPreferences = $userPreferencesResponse.data.preferences
    
    Write-Host "User Preferences:" -ForegroundColor Yellow
    foreach ($pref in $userPreferences) {
        Write-Host "  - Category: $($pref.category.name), Weight: $($pref.weight)"
    }
} catch {
    Write-Host "Failed to get preferences: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 5: Get personalized posts
Write-Host "`n=== Step 5: Get Personalized Posts ===" -ForegroundColor Green
try {
    $personalizedResponse = Invoke-RestMethod -Uri "$baseUrl/posts/personalized?page=1&limit=5" -Method Get -Headers $headers
    $personalizedPosts = $personalizedResponse.data.posts
    $pagination = $personalizedResponse.data.pagination
    
    Write-Host "Personalized Posts (Total: $($pagination.totalPosts)):" -ForegroundColor Yellow
    foreach ($post in $personalizedPosts) {
        $categoryName = if ($post.category) { $post.category.name } else { "No Category" }
        $relevanceScore = if ($post.relevanceScore) { "Score: $($post.relevanceScore)" } else { "" }
        Write-Host "  - Post ID: $($post.id), Category: $categoryName, Likes: $($post._count.likes), Comments: $($post._count.comments) $relevanceScore"
    }
} catch {
    Write-Host "Failed to get personalized posts: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 6: Get suggested posts (trending)
Write-Host "`n=== Step 6: Get Suggested Posts (Trending) ===" -ForegroundColor Green
try {
    $suggestedResponse = Invoke-RestMethod -Uri "$baseUrl/posts/suggested?page=1&limit=5" -Method Get -Headers $headers
    $suggestedPosts = $suggestedResponse.data.posts
    $suggestionInfo = $suggestedResponse.data.suggestion
    
    Write-Host "Suggested Posts ($($suggestionInfo.description)):" -ForegroundColor Yellow
    foreach ($post in $suggestedPosts) {
        $categoryName = if ($post.category) { $post.category.name } else { "No Category" }
        Write-Host "  - Post ID: $($post.id), Category: $categoryName, Likes: $($post._count.likes), Comments: $($post._count.comments)"
    }
} catch {
    Write-Host "Failed to get suggested posts: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 7: Compare with regular posts
Write-Host "`n=== Step 7: Get Regular Posts (for comparison) ===" -ForegroundColor Green
try {
    $regularResponse = Invoke-RestMethod -Uri "$baseUrl/posts?page=1&limit=5" -Method Get
    $regularPosts = $regularResponse.data.posts
    
    Write-Host "Regular Posts (no personalization):" -ForegroundColor Yellow
    foreach ($post in $regularPosts) {
        $categoryName = if ($post.category) { $post.category.name } else { "No Category" }
        Write-Host "  - Post ID: $($post.id), Category: $categoryName, Likes: $($post._count.likes), Comments: $($post._count.comments)"
    }
} catch {
    Write-Host "Failed to get regular posts: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== API Testing Complete! ===" -ForegroundColor Green
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "- Personalized posts are tailored based on user preferences"
Write-Host "- Suggested posts show trending content from the last 7 days"
Write-Host "- Regular posts show all posts ordered by creation date"
Write-Host "- The algorithm considers user engagement, category popularity, and recency"
