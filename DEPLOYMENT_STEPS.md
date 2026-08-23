# 🚀 EvoBin Deployment Guide

This guide details the step-by-step procedure for deploying the **EvoBin (EcoWaste AI)** application across **MongoDB Atlas** (Database), **Render** (Backend API), and **Vercel** (Frontend Web App).

---

## 📋 Architecture & Prerequisites

- **Frontend**: React + Vite + TypeScript (Hosted on **Vercel**)
- **Backend**: FastAPI + Uvicorn + OpenCV Headless (Hosted on **Render**)
- **Database**: MongoDB Atlas Cloud Cluster
- **Version Control**: Git & GitHub Repository

---

## 🛠️ Codebase Pre-Deployment Fixes Applied

The following changes have already been configured in your project repository:

1. **Dynamic Frontend API Base URL**:
   - Updated [`frontend/src/services/api.ts`](frontend/src/services/api.ts) to utilize `import.meta.env.VITE_API_BASE_URL` dynamically when deployed.

2. **Vercel Client Routing**:
   - Added [`frontend/vercel.json`](frontend/vercel.json) to handle Single Page Application (SPA) rewrites to `index.html` (prevents 404 errors on page refreshes).

3. **Linux Compatibility on Render**:
   - Updated [`backend/requirements.txt`](backend/requirements.txt) to use `opencv-python-headless` instead of `opencv-python` to avoid missing `libGL.so.1` Linux dependencies.

4. **Render Uvicorn Procfile**:
   - Added [`backend/Procfile`](backend/Procfile) with `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

5. **Backend Environment Defaults**:
   - Updated [`backend/app/config.py`](backend/app/config.py) to provide default values and fallback handling for environment variables.

---

## 🌐 Step 1: MongoDB Atlas Setup (Database)

1. **Create Account & Cluster**:
   - Register at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
   - Click **Create a Deployment** and select **M0 Free Tier**.
   - Choose a cloud provider and region close to your user base.

2. **Create Database User**:
   - Navigate to **Security** → **Database Access**.
   - Click **Add New Database User**.
   - Set Username (e.g. `evobin_user`) and a secure password.
   - Assign the **Read and write to any database** privilege.

3. **Configure Network Access**:
   - Navigate to **Security** → **Network Access**.
   - Click **Add IP Address** and select **Allow Access from Anywhere** (`0.0.0.0/0`).
   - *This allows Render worker instances to connect to MongoDB.*

4. **Obtain Connection String**:
   - Navigate to **Database** → **Connect** → **Drivers** (Python / Motor).
   - Copy your connection string:
     ```text
     mongodb+srv://evobin_user:<password>@cluster0.xxxxx.mongodb.net/evobin_db?retryWrites=true&w=majority
     ```

5. *(Optional)* **Seed Initial Data**:
   - Add your connection string to `backend/.env`:
     ```env
     MONGO_URI=mongodb+srv://evobin_user:<password>@cluster0.xxxxx.mongodb.net/evobin_db?retryWrites=true&w=majority
     DB_NAME=evobin_db
     ```
   - Populate users, collection centers, events, and rewards:
     ```bash
     cd backend
     python -m app.seed_data
     ```

---

## 🐍 Step 2: Render Deployment (FastAPI Backend)

1. **Push Repository to GitHub**:
   - Commit all files and push your repository to GitHub.

2. **Create New Web Service on Render**:
   - Log into [Render Dashboard](https://dashboard.render.com/).
   - Click **New +** → **Web Service**.
   - Select and connect your GitHub repository.

3. **Configure Render Service Parameters**:
   | Setting | Value |
   | :--- | :--- |
   | **Name** | `evobin-backend` |
   | **Region** | Oregon (US West) or closest region |
   | **Root Directory** | `backend` |
   | **Runtime** | `Python 3` |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

4. **Set Environment Variables**:
   Under **Environment Variables**, add:
   | Key | Value |
   | :--- | :--- |
   | `MONGO_URI` | `mongodb+srv://evobin_user:<password>@cluster0.xxxxx.mongodb.net/evobin_db?retryWrites=true&w=majority` |
   | `DB_NAME` | `evobin_db` |

5. **Deploy & Copy URL**:
   - Click **Create Web Service**.
   - Once deployed, copy your live API URL (e.g. `https://evobin-backend.onrender.com`).
   - Verify by opening `https://evobin-backend.onrender.com/docs` in your browser.

---

## ⚡ Step 3: Vercel Deployment (React Frontend)

1. **Create Vercel Project**:
   - Log into [Vercel Dashboard](https://vercel.com/dashboard).
   - Click **Add New...** → **Project**.
   - Import your GitHub repository.

2. **Configure Project Settings**:
   | Setting | Value |
   | :--- | :--- |
   | **Framework Preset** | `Vite` |
   | **Root Directory** | `frontend` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

3. **Set Environment Variables**:
   Add the backend API base URL under **Environment Variables**:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://evobin-backend.onrender.com` *(Use your actual Render URL)* |

4. **Deploy**:
   - Click **Deploy**.
   - Vercel will build your application and generate your live deployment link (e.g., `https://evobin-frontend.vercel.app`).

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env` / Render Environment)
```env
MONGO_URI=mongodb+srv://evobin_user:<password>@cluster0.xxxxx.mongodb.net/evobin_db?retryWrites=true&w=majority
DB_NAME=evobin_db
```

### Frontend (`frontend/.env` / Vercel Environment)
```env
VITE_API_BASE_URL=https://evobin-backend.onrender.com
```

---

## ✅ Post-Deployment Verification

1. **Backend Health Check**:
   - Open `https://<your-render-app>.onrender.com/` in your browser. Expected response:
     ```json
     {
       "status": "EvoBin Production API running",
       "version": "1.0.0",
       "documentation": "/docs"
     }
     ```

2. **Frontend Authentication & Data Flow**:
   - Open `https://<your-vercel-app>.vercel.app/`
   - Log in with seeded admin credentials:
     - **Email**: `admin@ewaste.com`
     - **Password**: `admin123`
   - Verify that devices, rewards, and leaderboards load correctly from MongoDB Atlas.
