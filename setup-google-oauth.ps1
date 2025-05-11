# Grace Placement: Google OAuth Setup Script
# This script helps you set up the Google OAuth credentials for your Grace Placement app

Write-Host "=== Grace Placement: Google OAuth Setup ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will guide you through the process of configuring Google OAuth"
Write-Host "for your Grace Placement application with Supabase."
Write-Host ""

# Check if environment variables exist
Write-Host "Checking environment variables..." -ForegroundColor Yellow
$envLocalExists = Test-Path ".env.local"
if ($envLocalExists) {
    Write-Host "✅ .env.local file found" -ForegroundColor Green
} else {
    Write-Host "❌ .env.local file not found" -ForegroundColor Red
    Write-Host "Creating a sample .env.local file..." -ForegroundColor Yellow
    @"
NEXT_PUBLIC_SUPABASE_URL=https://aunmhtifhqlyqwbphvxv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# Google OAuth Credentials - Replace with your actual Google OAuth client ID
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
"@ | Out-File -FilePath ".env.local" -Encoding utf8
    Write-Host "✅ Sample .env.local file created" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Google Cloud Setup Instructions ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to the Google Cloud Console (https://console.cloud.google.com/)" -ForegroundColor White
Write-Host "2. Create a new project or select an existing one" -ForegroundColor White
Write-Host "3. Navigate to 'APIs & Services' > 'Credentials'" -ForegroundColor White
Write-Host "4. Click 'Configure Consent Screen' and set up an External user type" -ForegroundColor White
Write-Host "5. Create OAuth Client ID for a Web Application" -ForegroundColor White
Write-Host "6. Add these Authorized JavaScript origins:" -ForegroundColor White
Write-Host "   - http://localhost:3000" -ForegroundColor Yellow
Write-Host "   - https://grace-placement.vercel.app (or your production URL)" -ForegroundColor Yellow
Write-Host ""
Write-Host "7. Add these Authorized redirect URIs:" -ForegroundColor White
Write-Host "   - http://localhost:3000/auth" -ForegroundColor Yellow
Write-Host "   - https://grace-placement.vercel.app/auth" -ForegroundColor Yellow
Write-Host "   - https://aunmhtifhqlyqwbphvxv.supabase.co/auth/v1/callback" -ForegroundColor Yellow
Write-Host ""

$createdCredentials = Read-Host "Have you created your Google OAuth credentials? (y/n)"

if ($createdCredentials -eq "y" -or $createdCredentials -eq "Y") {
    $clientId = Read-Host "Enter your Google Client ID"
    
    # Update environment files
    # .env.local
    if (Test-Path ".env.local") {
        $envLocalContent = Get-Content ".env.local" -Raw
        $updatedContent = $envLocalContent -replace "NEXT_PUBLIC_GOOGLE_CLIENT_ID=.*", "NEXT_PUBLIC_GOOGLE_CLIENT_ID=$clientId"
        $updatedContent | Out-File -FilePath ".env.local" -Encoding utf8
        Write-Host "✅ Updated .env.local with Google Client ID" -ForegroundColor Green
    }
    
    # .env.production
    if (Test-Path ".env.production") {
        $envProdContent = Get-Content ".env.production" -Raw
        $updatedContent = $envProdContent -replace "NEXT_PUBLIC_GOOGLE_CLIENT_ID=.*", "NEXT_PUBLIC_GOOGLE_CLIENT_ID=$clientId"
        $updatedContent | Out-File -FilePath ".env.production" -Encoding utf8
        Write-Host "✅ Updated .env.production with Google Client ID" -ForegroundColor Green
    } else {
        Write-Host "❌ .env.production file not found" -ForegroundColor Red
        Write-Host "Creating a .env.production file..." -ForegroundColor Yellow
        @"
NEXT_PUBLIC_SUPABASE_URL=https://aunmhtifhqlyqwbphvxv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://grace-placement.vercel.app
# Google OAuth Credentials
NEXT_PUBLIC_GOOGLE_CLIENT_ID=$clientId
"@ | Out-File -FilePath ".env.production" -Encoding utf8
        Write-Host "✅ Created .env.production file with Google Client ID" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "=== Supabase Configuration ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Now you need to configure Google provider in Supabase:" -ForegroundColor White
    Write-Host "1. Go to your Supabase dashboard: https://app.supabase.com/" -ForegroundColor White
    Write-Host "2. Select your project: Grace Placement" -ForegroundColor White
    Write-Host "3. Navigate to Authentication > Providers" -ForegroundColor White
    Write-Host "4. Find Google and toggle it ON" -ForegroundColor White
    Write-Host "5. Enter your Google Client ID: $clientId" -ForegroundColor Yellow
    Write-Host "6. Enter your Google Client Secret from the Google Cloud Console" -ForegroundColor Yellow
    Write-Host "7. Set Authorized Redirect URL to: https://aunmhtifhqlyqwbphvxv.supabase.co/auth/v1/callback" -ForegroundColor Yellow
    Write-Host "8. Save the changes" -ForegroundColor White
    Write-Host ""
    Write-Host "✅ Google OAuth setup is now complete!" -ForegroundColor Green
    
} else {
    Write-Host ""
    Write-Host "Please create your Google OAuth credentials before continuing with the setup." -ForegroundColor Yellow
    Write-Host "Follow the instructions in GOOGLE-AUTH-SETUP.md for detailed steps." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
