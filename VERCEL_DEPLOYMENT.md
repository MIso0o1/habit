# Vercel Deployment Guide

## Prerequisites
- Vercel account (https://vercel.com)
- Git repository (GitHub, GitLab, or Bitbucket)
- Node.js 18+ installed locally

## Setup Instructions

### 1. Push to Git Repository
```bash
git init
git add .
git commit -m "Initial commit - Habit Tracker"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
npm install -g vercel
vercel
```
Follow the prompts to connect your account and deploy.

#### Option B: Using Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Vercel will auto-detect the settings from `vercel.json`
5. Click "Deploy"

### 3. Environment Variables (if needed)
If your app requires environment variables:
1. Go to your project settings on Vercel
2. Navigate to "Settings" → "Environment Variables"
3. Add any required variables

## Important Notes

### .npmrc Configuration
The `.npmrc` file in the project root ensures that `npm install --legacy-peer-deps` is used automatically:
```
legacy-peer-deps=true
```

This is critical for this project to install dependencies correctly.

### Build Configuration
The `vercel.json` file specifies:
- **buildCommand**: `npm run build` - Builds Vite + backend
- **outputDirectory**: `dist` - Where built files are served from
- **installCommand**: `npm install --legacy-peer-deps` - Ensures correct dependency resolution

### Database (SQLite)
⚠️ **Important**: This project uses SQLite for data storage. SQLite databases are file-based and will be reset on each Vercel deployment (since Vercel is a serverless platform).

**For production use, consider:**
- Using a cloud database (PostgreSQL, MongoDB, etc.)
- Implementing data persistence via a separate database service
- Using Vercel's KV store for session management

### API Routes
The backend runs as a Node.js server. All API routes are prefixed with `/api/` and will be handled by the Express server in `server/index.ts`.

## Troubleshooting

### Build Fails with Peer Dependency Errors
- The `.npmrc` file should handle this automatically
- If issues persist, check that `legacy-peer-deps=true` is in `.npmrc`

### App Crashes After Deployment
- Check Vercel logs: Project → Deployments → [Latest] → Logs
- Ensure all environment variables are set
- Verify the build output includes both frontend and backend

### SQLite Database Issues
- SQLite files are ephemeral on Vercel
- For persistent data, migrate to a cloud database

## Monitoring

After deployment:
1. Check Vercel Analytics: Project → Analytics
2. Monitor logs: Project → Deployments → [Latest] → Logs
3. Test the app at your Vercel domain

## Rollback

If you need to revert to a previous deployment:
1. Go to Project → Deployments
2. Find the previous deployment
3. Click the three dots → "Promote to Production"

## Support

For issues:
- Check Vercel documentation: https://vercel.com/docs
- Review build logs in Vercel dashboard
- Ensure `.npmrc` and `vercel.json` are correctly configured
