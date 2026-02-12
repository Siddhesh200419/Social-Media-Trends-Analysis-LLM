# Quick Start Guide

## Prerequisites
- Python 3.8+ installed
- Node.js 18+ installed
- Bluesky account credentials

## Step 1: Backend Setup

```bash
# Navigate to backend
cd Backend

# Activate virtual environment (if exists)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your Bluesky credentials
# Add these lines:
# BSKY_HANDLE=your_handle.bsky.social
# BSKY_APP_PASSWORD=your_app_password

# Start Flask server
python -m app.api.server
```

Backend will run on: **http://localhost:5000**

## Step 2: Frontend Setup (New Terminal)

```bash
# Navigate to frontend
cd Frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Frontend will run on: **http://localhost:5173** (or port shown in terminal)

## That's it! 

Open your browser to the frontend URL and you should see the Trend Pulse dashboard with real Bluesky data!

## Troubleshooting

- **Backend errors**: Make sure `.env` file exists with correct Bluesky credentials
- **Frontend can't connect**: Ensure backend is running on port 5000
- **Port already in use**: Change port in `Backend/app/api/server.py` (line 293) or `Frontend/vite.config.js`
