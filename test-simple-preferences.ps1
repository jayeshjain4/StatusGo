# Simple test for preferences endpoint
Write-Host "Testing Preferences Endpoint..." -ForegroundColor Green

# First login
$loginData = '{"email":"p@gmail.com","password":"123456"}'
$loginHeaders = @{"Content-Type" = "application/json"}

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Headers $loginHeaders -Body $loginData
    
    if ($loginResponse.success) {
        Write-Host "Login successful!" -ForegroundColor Green
        $token = $loginResponse.data.token
        
        # Test preferences
        $preferencesData = '{"categoryIds":[1,2,3]}'
        $preferencesHeaders = @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $token"
        }
        
        Write-Host "Testing preferences endpoint..." -ForegroundColor Yellow
        $preferencesResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/preferences" -Method Post -Headers $preferencesHeaders -Body $preferencesData
        
        Write-Host "Preferences response:" -ForegroundColor Green
        Write-Host ($preferencesResponse | ConvertTo-Json -Depth 3) -ForegroundColor White
        
    } else {
        Write-Host "Login failed" -ForegroundColor Red
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
