# Simple test for auth preferences
Write-Host "Testing Auth Preferences..." -ForegroundColor Green

# Login
$loginData = '{"email":"p@gmail.com","password":"123456"}'
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -ContentType "application/json" -Body $loginData

if ($loginResponse.success) {
    Write-Host "Login Success!" -ForegroundColor Green
    $token = $loginResponse.data.token
    
    # Set preferences
    $preferencesData = '{"categoryIds":[1,2,3,4]}'
    $headers = @{"Authorization"="Bearer $token"; "Content-Type"="application/json"}
    
    $preferencesResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/set-preferences" -Method Post -Headers $headers -Body $preferencesData
    
    if ($preferencesResponse.success) {
        Write-Host "Preferences Set Successfully!" -ForegroundColor Green
        Write-Host "Message: $($preferencesResponse.message)" -ForegroundColor Cyan
    } else {
        Write-Host "Preferences Failed: $($preferencesResponse.message)" -ForegroundColor Red
    }
} else {
    Write-Host "Login Failed" -ForegroundColor Red
}
