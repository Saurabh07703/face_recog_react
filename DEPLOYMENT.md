# Deployment Guide

This application uses a split architecture:
1.  **Frontend**: React (Vite) - Suitable for **Vercel**.
2.  **Backend**: Flask (Python + PyTorch) - Suitable for **Render** (or Railway).
    *   *Note: Vercel is NOT recommended for the backend because the specialized AI libraries (PyTorch, OpenCV) exceed Vercel's serverless function size limits.*

## Part 1: Deploy Backend (Render)

We will deploy the backend first to get the URL.

1.  **Push your code to GitHub**.
2.  Go to [Render.com](https://render.com) and sign up/login.
3.  **Create a New Blueprint Instance**:
    *   Click **"New +"** -> **"Blueprint"**.
    *   Connect your GitHub repository.
    *   Render will automatically detect the `render.yaml` file.
    *   Click **"Apply"** or **"Approve"**.
4.  **Persistent Storage (Critical)**:
    *   By default, the app uses `features.txt`, which is **ephemeral** on Render (it gets deleted on restart).
    *   **Requirement**: Set up Firebase Firestore.
    *   **Action**: Upload your `serviceAccountKey.json` contents as a **Secret File** named `serviceAccountKey.json` in the Render dashboard (Environment tab) -> OR relies on the Blueprint prompting you for it (if configured, but simpler to add manually after if needed).
    *   *Note*: The blueprint defines the secret `serviceAccountKey.json`. Render might ask you to input the *contents* of this file during the Blueprint creation. Paste the entire JSON content there.

5.  **Wait for deploy**. Once finished, copy the **onrender.com URL** (e.g., `https://face-recog-backend.onrender.com`).

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
