# Deployment Guide

This application uses a split architecture:
1.  **Frontend**: React (Vite) - Suitable for **Vercel**.
2.  **Backend**: Flask (Python + PyTorch) - Suitable for **Render** (or Railway).
    *   *Note: Vercel is NOT recommended for the backend because the specialized AI libraries (PyTorch, OpenCV) exceed Vercel's serverless function size limits.*

## Part 1: Deploy Backend (Render)

We will deploy the backend first to get the URL.

1.  **Push your code to GitHub**.
2.  Go to [Render.com](https://render.com) and sign up/login.
3.  Click **"New +"** -> **"Web Service"**.
4.  Connect your GitHub repository.
5.  **Configure the Service**:
    *   **Root Directory**: `backend` (Important! This tells Render where the Python app is).
    *   **Runtime**: **Python 3**.
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `gunicorn app:app`
    *   **Plan**: Free (or Starter if you need more RAM for the AI model).
6.  **Environment Variables** (Advanced):
    *   Upload your `serviceAccountKey.json` contents as a "Secret File" named `serviceAccountKey.json` in Render dashboard if you want Firebase to work.
    *   *Alternatively, just for testing, it will run in "local mode" (features.txt) but that is ephemeral on Render's free tier (data is lost on restart).* **Highly Recommended to set up Firebase properly on Render**.
7.  Click **"Create Web Service"**.
8.  **Wait for deploy**. Once finished, copy the **onrender.com URL** (e.g., `https://face-recog-backend.onrender.com`).

## Part 2: Deploy Frontend (Vercel)

1.  Go to [Vercel.com](https://vercel.com) and sign up/login.
2.  Click **"Add New..."** -> **"Project"**.
3.  Import the same GitHub repository.
4.  **Configure the Project**:
    *   **Root Directory**: `frontend` (Click "Edit" next to Root Directory and select `frontend`).
    *   **Framework Preset**: Vite (should be auto-detected).
    *   **Environment Variables**:
        *   Key: `VITE_API_URL`
        *   Value: `https://your-backend-url.onrender.com` (The URL you copied from Step 1, **without** the trailing slash).
5.  Click **"Deploy"**.

## Summary

*   **Frontend**: Hosted on Vercel, communicates with...
*   **Backend**: Hosted on Render, runs the heavy AI models.
