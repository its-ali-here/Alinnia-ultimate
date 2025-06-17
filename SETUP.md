# Environment Setup Guide

This guide will help you set up the required environment variables for the Alinnia application.

## Quick Setup

### 1. Copy the environment file
\`\`\`bash
cp .env.local .env.local.backup  # backup if exists
\`\`\`

### 2. Your Supabase Configuration (Already Set)
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://pjtmy8ogjqhqzxvqvqvq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqdG15OG9nanFocXp4dnF2cXZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NzI4NzQsImV4cCI6MjA1MjU0ODg3NH0.Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7E
\`\`\`

### 3. Get Your Groq API Key

**You need to add your Groq API key:**

1. Go to [Groq Console](https://console.groq.com/)
2. Create an account or sign in
3. Go to API Keys section
4. Create a new API key
5. Copy the key and replace `gsk_your_actual_groq_api_key_here` in your `.env.local` file

### 4. Complete Database Setup

You'll also need to get your database password from Supabase:

1. Go to [Supabase Dashboard](https://app.supabase.io/)
2. Select your project: `pjtmy8ogjqhqzxvqvqvq`
3. Go to Settings → Database
4. Copy your database password
5. Replace `your_actual_password_here` in the POSTGRES_PASSWORD field

## Required Actions

### ⚠️ IMPORTANT: Add Your Groq API Key

Replace this line in your `.env.local`:
\`\`\`env
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
\`\`\`

With your actual Groq API key:
\`\`\`env
GROQ_API_KEY=gsk_abc123your_real_key_here
\`\`\`

### ⚠️ IMPORTANT: Add Your Database Password

Replace this line in your `.env.local`:
\`\`\`env
POSTGRES_PASSWORD=your_actual_password_here
\`\`\`

With your actual database password from Supabase.

## Verification Steps

After setting up your environment variables:

1. **Restart your development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

2. **Check the console** - No more "missing environment variable" errors

3. **Test authentication** - Try signing up or logging in

4. **Test AI chat** - Go to `/dashboard/ai` and try chatting

## For Production (Vercel)

Your Vercel project should have these environment variables set:

- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- ✅ `GROQ_API_KEY` (you need to add this)
- ✅ All POSTGRES_* variables
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

## Troubleshooting

### If you see "Supabase not configured":
- Check that your `.env.local` file exists
- Verify the Supabase URL and anon key are correct
- Restart your development server

### If you see "Groq API key not configured":
- Make sure you've added your actual Groq API key
- Verify the key starts with `gsk_`
- Check that there are no extra spaces

### If authentication doesn't work:
- Verify your database password is correct
- Check the Supabase dashboard for any issues
- Look at the browser console for specific error messages
