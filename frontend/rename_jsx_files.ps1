# PowerShell script to rename JS files containing JSX to .jsx extension

Write-Host "Renaming React component files from .js to .jsx..."

# Change to src directory
Set-Location "src"

# Rename main App.js
if (Test-Path "App.js") {
    Rename-Item "App.js" "App.jsx"
    Write-Host "✅ Renamed App.js → App.jsx"
}

# Rename route files
if (Test-Path "routes\login.js") {
    Rename-Item "routes\login.js" "routes\login.jsx"
    Write-Host "✅ Renamed routes\login.js → routes\login.jsx"
}

if (Test-Path "routes\register.js") {
    Rename-Item "routes\register.js" "routes\register.jsx"
    Write-Host "✅ Renamed routes\register.js → routes\register.jsx"
}

if (Test-Path "routes\upload.js") {
    Rename-Item "routes\upload.js" "routes\upload.jsx"
    Write-Host "✅ Renamed routes\upload.js → routes\upload.jsx"
}

# Check for dashboard.jsx (might already be correct)
if (Test-Path "routes\dashboard.js") {
    Rename-Item "routes\dashboard.js" "routes\dashboard.jsx"
    Write-Host "✅ Renamed routes\dashboard.js → routes\dashboard.jsx"
}

Write-Host ""
Write-Host "File renaming complete! Now update import statements..."
Write-Host ""
