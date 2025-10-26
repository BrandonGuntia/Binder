# Supabase Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication with Supabase for your Binder app.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- A Google Cloud Console account (https://console.cloud.google.com)

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in your project details:
   - Name: `Binder` (or your preferred name)
   - Database Password: Create a strong password
   - Region: Choose the closest to your users
4. Click "Create new project" and wait for it to initialize

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, click on the **Settings** icon (⚙️) in the sidebar
2. Navigate to **API** section
3. Copy the following values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (a long JWT token)

## Step 3: Configure Environment Variables

1. Create a `.env` file in your project root (it's already in .gitignore):
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 4: Set Up Google OAuth Provider

### 4.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - User Type: External (for testing) or Internal (for organization use)
   - Fill in app information: App name, user support email, etc.
   - Add scopes: `./auth/userinfo.email` and `./auth/userinfo.profile`
   - Add test users if using External
6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `Binder App`
   - Authorized redirect URIs: **Leave blank for now** (we'll add this in the next step)

### 4.2 Configure Google OAuth in Supabase

1. In your Supabase project dashboard, go to **Authentication** > **Providers**
2. Find **Google** and enable it
3. Enter your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
4. Copy the **Callback URL (for OAuth)** shown in Supabase (looks like: `https://xxxxx.supabase.co/auth/v1/callback`)
5. Go back to Google Cloud Console > Credentials
6. Edit your OAuth 2.0 Client ID
7. Add the Supabase callback URL to **Authorized redirect URIs**
8. Save changes

### 4.3 Configure Mobile Deep Linking

For the Google OAuth to work on mobile, you need to add your app's scheme:

1. In Google Cloud Console, edit your OAuth client
2. Add these to **Authorized redirect URIs**:
   ```
   binder://auth/callback
   ```

## Step 5: Configure Supabase Email Settings (Optional)

If you want to enable email/password authentication:

1. Go to **Authentication** > **URL Configuration** in Supabase
2. Set your **Site URL** to your app's URL (for development: `http://localhost:8081`)
3. Add redirect URLs if needed

## Step 6: Enable Email/Password Authentication (Optional)

1. Go to **Authentication** > **Providers** in Supabase
2. Enable **Email** provider
3. Configure email templates if desired under **Authentication** > **Email Templates**

## Step 7: Test Your Setup

1. Start your Expo development server:
   ```bash
   npm run ios
   # or
   npm run android
   ```

2. Try signing in with Google:
   - Click "Sign in with Google" button
   - You should be redirected to Google's OAuth page
   - After authorization, you'll be redirected back to your app

3. Check Supabase Dashboard:
   - Go to **Authentication** > **Users**
   - You should see your newly created user

## Troubleshooting

### Error: "Invalid redirect URI"
- Make sure the redirect URI in Google Console exactly matches the Supabase callback URL
- Check that you've added `binder://auth/callback` for mobile

### Error: "Provider not enabled"
- Ensure Google provider is enabled in Supabase Dashboard
- Verify Client ID and Secret are correctly entered

### OAuth window closes immediately
- Check your `.env` file is properly configured
- Restart your Expo dev server after changing `.env`
- Make sure the scheme in `app.json` matches the redirect URI

### Users not appearing in Supabase
- Check the Supabase logs in Dashboard > Logs
- Verify your API keys are correct

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Google OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Expo Authentication Guide](https://docs.expo.dev/guides/authentication/)

## Next Steps

After successful authentication, you can:
1. Access user data with `supabase.auth.getUser()`
2. Set up protected routes
3. Create user profiles in your database
4. Implement sign-out functionality

## Security Notes

- **NEVER** commit your `.env` file to git
- Keep your Supabase anon key secure
- Use Row Level Security (RLS) policies in Supabase for database security
- Rotate your secrets regularly
