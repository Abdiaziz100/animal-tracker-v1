# Database Connection Issue - Analysis and Fix Plan

## Problem Identified
The mobile app is unable to save animals to the database because the backend is not configured with a persistent database URL.

## Root Cause
In `backend/app.py`, there is no `SQLALCHEMY_DATABASE_URI` configuration set. This means:
- When running locally: Uses default `sqlite:///tracker.db` (relative path)
- When deployed to Render: Creates a NEW database on each deployment/restart (not persistent)
- The data added from mobile app is saved to this ephemeral database

## Solution Plan

### 1. Update backend/app.py
Add proper database configuration that:
- Uses an absolute path for SQLite database
- Configures for production deployment (Render)

### 2. Key Changes
- Add `app.config['SQLALCHEMY_DATABASE_URI']` with absolute path
- Use environment variable for production database URL if available
- Fall back to absolute path for SQLite

### 3. Files to Edit
- `backend/app.py` - Add database configuration

### 4. After Fix
- Commit and push changes to Git
- Redeploy to Render
- Test by adding animal from mobile app

