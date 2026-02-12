# Trend Pulse - Bluesky Social Media Analytics

A full-stack application that analyzes Bluesky posts, detects trends, categorizes topics, and provides sentiment analysis using BERT and Mistral models.

## Project Structure

- **Backend**: Flask API server (`Backend/app/api/server.py`)
- **Frontend**: React + Vite application (`Frontend/`)

## Setup Instructions

### Backend Setup

1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```

2. Create and activate a virtual environment (if not already created):
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # or
   source venv/bin/activate  # Linux/Mac
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the `Backend` directory with your Bluesky credentials:
   ```
   BSKY_HANDLE=your_handle.bsky.social
   BSKY_APP_PASSWORD=your_app_password
   ```

5. Start the Flask server:
   ```bash
   python -m app.api.server
   ```
   
   The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the Frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   
   The frontend will run on `http://localhost:5173` (or the port shown in terminal)

## Features

- **Dashboard**: View trending categories and topics
- **Search**: Filter and search topics by category, sentiment, and relevance
- **Topic Details**: View detailed analysis of individual topics
- **Category Details**: View all topics within a category
- **Saved Reports**: (Placeholder - not yet implemented)

## API Endpoints

- `GET /api/categories` - Get all categories
- `GET /api/topics` - Get topics (supports `?id=`, `?category_id=`, `?sort=`, `?limit=`)
- `GET /api/tweets` - Get tweets (supports `?topic_id=`)
- `GET /api/health` - Health check

## Notes

- The sentiment analysis currently uses placeholder values (all neutral) until Mistral integration is complete
- Topic summaries use placeholder descriptions until BERT summarization is implemented
- Saved reports functionality is a placeholder and not yet implemented
