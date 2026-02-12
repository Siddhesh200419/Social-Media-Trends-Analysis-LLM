from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging

from app.pipeline import run_pipeline

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Social Media Trend Analysis API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Models (Strictly aligned with requirements) ---

class Category(BaseModel):
    id: str
    name: str
    topic_count: int
    total_posts: int
    avg_sentiment: float
    relevance_score: float

class Topic(BaseModel):
    id: str
    name: str
    category_id: str
    post_count: int
    engagement_score: int
    avg_sentiment: float

class Post(BaseModel):
    id: str
    topic_id: str
    text: str
    sentiment_score: float
    posted_at: str
    engagement_score: int

class PipelineResponse(BaseModel):
    categories: List[Category]
    topics: List[Topic]
    posts: List[Post]

# --- Endpoints ---

@app.get("/pipeline/run", response_model=PipelineResponse)
def run_analysis(
    limit: int = Query(100, description="Number of posts to fetch"),
    query: str = Query("tech", description="Search query for posts")
):
    """
    Triggers the full analysis pipeline:
    1. Fetch posts from Bluesky
    2. Clean and detect trends
    3. Analyze sentiment and categories
    4. Return structured results
    """
    try:
        results = run_pipeline(limit=limit, query=query)
        return results
    except Exception as e:
        logger.error(f"Pipeline failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "ok"}
