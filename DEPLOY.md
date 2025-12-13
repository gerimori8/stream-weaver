# Deployment Guide - AuraDL

## Deploy to Vercel

### 1. Push to GitHub

First, connect this project to GitHub:
1. Go to Settings in Lovable
2. Click on GitHub tab
3. Connect and create a new repository

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the following:

**Framework Preset:** Vite

**Build Command:** `npm run build`

**Output Directory:** `dist`

### 3. Add Environment Variables

In Vercel project settings, add the following environment variable:

| Name | Value |
|------|-------|
| `RAPIDAPI_KEY` | `54067acf7amsh72fb2b9bfcefec0p1f0a98jsn3c3d503f4b1d` |

> ⚠️ **Security Note:** Never commit API keys to your repository. Always use environment variables.

### 4. Deploy

Click "Deploy" and wait for the build to complete.

## Local Development

1. Clone the repository
2. Copy `.env.example` to `.env` and add your API key
3. Install dependencies: `npm install`
4. Run development server: `npm run dev`

## API Information

This app uses the **YouTube Media Downloader** API from RapidAPI:
- **Host:** youtube-media-downloader.p.rapidapi.com
- **Endpoint:** /v2/video/details

### Rate Limits (Free Plan)
- 100 requests per month
- 500,000 hard limit

## Troubleshooting

### "API key not configured" error
Make sure you've added the `RAPIDAPI_KEY` environment variable in Vercel.

### CORS errors
The Vercel serverless function handles CORS automatically. If you see CORS errors, check that the API route is working correctly.

### Video not found
Some videos may be restricted or unavailable. Try a different video URL.
