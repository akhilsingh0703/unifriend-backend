# Vercel Stable Backend URL Solution

## Problem
Vercel creates new deployment URLs each time you deploy, causing the frontend to break.

## Solution Options

### Option 1: Use Vercel Production URL (Recommended)
Vercel provides a **stable production URL** that doesn't change:
- Format: `https://your-project-name.vercel.app`
- This URL is stable and points to your latest production deployment
- Go to Vercel Dashboard → Your Project → Settings → Domains
- Your production URL is: `https://[project-name].vercel.app`

### Option 2: Add Custom Domain (Best Practice)
1. Go to Vercel Dashboard → Your Backend Project → Settings → Domains
2. Add a custom domain: `api.unifriend.in` (or `backend.unifriend.in`)
3. Update DNS records as instructed by Vercel
4. Use this stable domain in your frontend

### Option 3: Use Vercel Environment Variable
Store the backend URL in Vercel environment variables and update it when needed.

## Current Setup
Your backend should use the **production deployment URL**, not preview URLs.

To find your stable production URL:
1. Go to https://vercel.com/dashboard
2. Select your backend project
3. Go to Settings → Domains
4. Use the production URL (usually `https://[project-name].vercel.app`)

## Update Frontend
Once you have the stable URL, update:
- `.env.production` 
- `.env.local`
- `src/lib/api.ts` (default fallback)

