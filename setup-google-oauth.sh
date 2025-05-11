#!/usr/bin/env bash

# This script helps you set up the Google OAuth credentials for your Grace Placement app

echo "=== Grace Placement: Google OAuth Setup ==="
echo ""
echo "This script will guide you through the process of configuring Google OAuth"
echo "for your Grace Placement application with Supabase."
echo ""

# Check if environment variables exist
echo "Checking environment variables..."
if [ -f ".env.local" ]; then
  echo "✅ .env.local file found"
else
  echo "❌ .env.local file not found"
  echo "Creating a sample .env.local file..."
  cat > .env.local << EOL
NEXT_PUBLIC_SUPABASE_URL=https://aunmhtifhqlyqwbphvxv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# Google OAuth Credentials - Replace with your actual Google OAuth client ID
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
EOL
  echo "✅ Sample .env.local file created"
fi

echo ""
echo "=== Google Cloud Setup Instructions ==="
echo ""
echo "1. Go to the Google Cloud Console (https://console.cloud.google.com/)"
echo "2. Create a new project or select an existing one"
echo "3. Navigate to 'APIs & Services' > 'Credentials'"
echo "4. Click 'Configure Consent Screen' and set up an External user type"
echo "5. Create OAuth Client ID for a Web Application"
echo "6. Add these Authorized JavaScript origins:"
echo "   - http://localhost:3000"
echo "   - https://grace-placement.vercel.app (or your production URL)"
echo ""
echo "7. Add these Authorized redirect URIs:"
echo "   - http://localhost:3000/auth"
echo "   - https://grace-placement.vercel.app/auth"
echo "   - https://aunmhtifhqlyqwbphvxv.supabase.co/auth/v1/callback"
echo ""
read -p "Have you created your Google OAuth credentials? (y/n): " created_credentials

if [ "$created_credentials" = "y" ] || [ "$created_credentials" = "Y" ]; then
  read -p "Enter your Google Client ID: " client_id
  
  # Update environment files
  # .env.local
  if [ -f ".env.local" ]; then
    sed -i "s/NEXT_PUBLIC_GOOGLE_CLIENT_ID=.*/NEXT_PUBLIC_GOOGLE_CLIENT_ID=$client_id/" .env.local
    echo "✅ Updated .env.local with Google Client ID"
  fi
  
  # .env.production
  if [ -f ".env.production" ]; then
    sed -i "s/NEXT_PUBLIC_GOOGLE_CLIENT_ID=.*/NEXT_PUBLIC_GOOGLE_CLIENT_ID=$client_id/" .env.production
    echo "✅ Updated .env.production with Google Client ID"
  else
    echo "❌ .env.production file not found"
    echo "Creating a .env.production file..."
    cat > .env.production << EOL
NEXT_PUBLIC_SUPABASE_URL=https://aunmhtifhqlyqwbphvxv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://grace-placement.vercel.app
# Google OAuth Credentials
NEXT_PUBLIC_GOOGLE_CLIENT_ID=$client_id
EOL
    echo "✅ Created .env.production file with Google Client ID"
  fi
  
  echo ""
  echo "=== Supabase Configuration ==="
  echo ""
  echo "Now you need to configure Google provider in Supabase:"
  echo "1. Go to your Supabase dashboard: https://app.supabase.com/"
  echo "2. Select your project: Grace Placement"
  echo "3. Navigate to Authentication > Providers"
  echo "4. Find Google and toggle it ON"
  echo "5. Enter your Google Client ID: $client_id"
  echo "6. Enter your Google Client Secret from the Google Cloud Console"
  echo "7. Set Authorized Redirect URL to: https://aunmhtifhqlyqwbphvxv.supabase.co/auth/v1/callback"
  echo "8. Save the changes"
  echo ""
  echo "✅ Google OAuth setup is now complete!"
  
else
  echo ""
  echo "Please create your Google OAuth credentials before continuing with the setup."
  echo "Follow the instructions in GOOGLE-AUTH-SETUP.md for detailed steps."
  echo ""
fi
