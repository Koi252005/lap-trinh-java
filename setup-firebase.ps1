# Firebase Configuration Script for BICAP
# Run this script and enter Firebase values from Firebase Console

$envFile = "bicap-web-client\.env.local"

Write-Host "============================================"
Write-Host "Firebase Configuration for BICAP"
Write-Host "============================================"
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path $envFile)) {
    Write-Host "Creating .env.local file..."
    @"
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ZVDJEQN2Y4
NEXT_PUBLIC_API_URL=http://localhost:5001/api
"@ | Out-File -FilePath $envFile -Encoding UTF8
    Write-Host "Created .env.local file"
}

Write-Host ""
Write-Host "How to get Firebase Config:"
Write-Host "1. Go to: https://console.firebase.google.com/"
Write-Host "2. Select your project (or create new)"
Write-Host "3. Click Web icon (</>) to add Web app"
Write-Host "4. Copy values from firebaseConfig"
Write-Host ""
Write-Host "Press Enter to continue..."
Read-Host

# Read current values
$content = Get-Content $envFile -Raw
$apiKey = ""
$authDomain = ""
$projectId = ""
$storageBucket = ""
$messagingSenderId = ""
$appId = ""

# Parse current values
if ($content -match "NEXT_PUBLIC_FIREBASE_API_KEY=([^\r\n]+)") {
    $apiKey = $matches[1].Trim()
}
if ($content -match "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=([^\r\n]+)") {
    $authDomain = $matches[1].Trim()
}
if ($content -match "NEXT_PUBLIC_FIREBASE_PROJECT_ID=([^\r\n]+)") {
    $projectId = $matches[1].Trim()
}
if ($content -match "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=([^\r\n]+)") {
    $storageBucket = $matches[1].Trim()
}
if ($content -match "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=([^\r\n]+)") {
    $messagingSenderId = $matches[1].Trim()
}
if ($content -match "NEXT_PUBLIC_FIREBASE_APP_ID=([^\r\n]+)") {
    $appId = $matches[1].Trim()
}

# Input values
Write-Host ""
Write-Host "Enter Firebase values (Press Enter to keep current value):"
Write-Host ""

$input = Read-Host "API Key [$apiKey]"
if ($input) { $apiKey = $input }

$input = Read-Host "Auth Domain [$authDomain]"
if ($input) { $authDomain = $input }

$input = Read-Host "Project ID [$projectId]"
if ($input) { $projectId = $input }

$input = Read-Host "Storage Bucket [$storageBucket]"
if ($input) { $storageBucket = $input }

$input = Read-Host "Messaging Sender ID [$messagingSenderId]"
if ($input) { $messagingSenderId = $input }

$input = Read-Host "App ID [$appId]"
if ($input) { $appId = $input }

# Write to file
$newContent = @"
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=$apiKey
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$authDomain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=$projectId
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$storageBucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$messagingSenderId
NEXT_PUBLIC_FIREBASE_APP_ID=$appId
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ZVDJEQN2Y4
NEXT_PUBLIC_API_URL=http://localhost:5001/api
"@

$newContent | Out-File -FilePath $envFile -Encoding UTF8 -NoNewline

Write-Host ""
Write-Host "Success! Updated .env.local file"
Write-Host ""
Write-Host "File location: $((Resolve-Path $envFile).Path)"
Write-Host ""
Write-Host "IMPORTANT:"
Write-Host "1. Enable Authentication in Firebase Console:"
Write-Host "   - Email/Password"
Write-Host "   - Google (optional)"
Write-Host ""
Write-Host "2. Restart dev server:"
Write-Host "   cd bicap-web-client"
Write-Host "   npm run dev"
Write-Host ""
