import logging
import uuid
import hashlib
from datetime import datetime
from typing import List, Dict, Any, Optional

from app.api.bluesky_client import fetch_public_posts
from app.preprocessing.cleaner import clean_text
from app.trends.trend_detector import detect_trends, calculate_engagement
from app.ml.sentiment import SentimentAnalyzer
from app.ml.categorizer import Categorizer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize ML models
# Loading them at module level ensures they are loaded once
sentiment_analyzer = SentimentAnalyzer()
categorizer = Categorizer()

def generate_id() -> str:
    """Generates a unique ID."""
    return str(uuid.uuid4())

def topic_id_from_name(name: str) -> str:
    return hashlib.md5(name.encode('utf-8')).hexdigest()

def run_pipeline(limit: int = 100, query: str = "tech") -> Dict[str, Any]:
    """
    Executes the full data processing pipeline.
    
    Steps:
    1. Fetch public Bluesky posts.
    2. Clean and preprocess text.
    3. Detect trending topics using hashtags + keywords.
    4. Associate posts with detected topics.
    5. Perform sentiment analysis on posts.
    6. Categorize topics.
    7. Aggregate results into Categories -> Topics -> Posts.
    """
    logger.info("Starting pipeline execution...")
    
    # Step 1: Fetch posts
    logger.info(f"Fetching posts with query='{query}' and limit={limit}...")
    raw_posts = fetch_public_posts(limit=limit, query=query)
    logger.info(f"Fetched {len(raw_posts)} posts.")
    
    # Step 2: Clean text and prepare post objects
    # We maintain a list of mutable post dictionaries to add analysis results
    processed_posts = []
    for post in raw_posts:
        cleaned_text = clean_text(post["text"])
        if not cleaned_text:
            continue
            
        processed_posts.append({
            "id": generate_id(),
            "original_text": post["text"],
            "cleaned_text": cleaned_text,
            "created_at": post["created_at"],
            "likes": post["likes"],
            "reposts": post["reposts"],
            "engagement_score": calculate_engagement(post["likes"], post["reposts"]),
            "topic_id": None, # To be assigned
            "sentiment_score": 0.0, # To be calculated
            "sentiment_label": "Neutral"
        })
        
    # Step 3: Detect Trends (Topics)
    # We pass the raw objects because detect_trends might need original text or specific fields
    # But detect_trends expects a list of dicts with "text", "likes", "reposts"
    # We can pass the processed_posts as they have these fields (mapped or added)
    # Actually detect_trends uses "text" key. processed_posts has "original_text" and "cleaned_text".
    # Let's create a temporary list for trend detection to ensure compatibility
    posts_for_detection = [
        {"text": p["cleaned_text"], "likes": p["likes"], "reposts": p["reposts"]} 
        for p in processed_posts
    ]
    
    # Get top 20 trends
    trends = detect_trends(posts_for_detection, top_n=20)
    logger.info(f"Detected {len(trends)} trends.")
    
    # Create Topic objects
    topics_map = {} # trend_name -> topic_data
    for trend_name, trend_score in trends:
        topics_map[trend_name] = {
            "id": topic_id_from_name(trend_name),
            "name": trend_name,
            "category_id": None, # To be assigned
            "post_ids": [],
            "engagement_score": 0, # To be aggregated
            "sentiment_sum": 0.0, # To be aggregated
            "post_count": 0,
            "trend_score": trend_score # Keep for reference
        }
        
    # Step 4: Associate Posts with Topics
    # Strategy: Assign post to the first matching top trend (simple, deterministic)
    # Or best match? Simple: if post contains trend keyword.
    
    assigned_posts = []
    
    for post in processed_posts:
        matched_topic_name = None
        
        # Check against trends in order of importance (trend_score)
        for trend_name, _ in trends:
            # Check if trend_name is in cleaned_text (whole word match preferred)
            # Using simple string inclusion for robustness as per "simple logic"
            if trend_name in post["cleaned_text"]:
                matched_topic_name = trend_name
                break
        
        if matched_topic_name:
            topic = topics_map[matched_topic_name]
            
            # Step 5: Sentiment Analysis
            sentiment_result = sentiment_analyzer.analyze(post["cleaned_text"])
            post["sentiment_score"] = sentiment_result["score"]
            post["sentiment_label"] = sentiment_result["label"]
            post["topic_id"] = topic["id"]
            
            # Update Topic Stats
            topic["post_ids"].append(post["id"])
            topic["post_count"] += 1
            topic["engagement_score"] += post["engagement_score"]
            topic["sentiment_sum"] += post["sentiment_score"]
            
            assigned_posts.append(post)
        else:
            # Post didn't match any top trend, ignore or put in "Other"?
            # Contract says "Posts (id, topic_id...)"
            # If we exclude them, we reduce noise. Let's exclude for now.
            pass
            
    # Step 6: Categorize Topics and Aggregate
    categories_map = {} # category_name -> category_data
    
    final_topics = []
    
    for topic_name, topic_data in topics_map.items():
        if topic_data["post_count"] == 0:
            continue
            
        # Calculate average sentiment
        topic_data["avg_sentiment"] = topic_data["sentiment_sum"] / topic_data["post_count"]
        
        # Categorize
        category_name = categorizer.categorize(topic_name)
        
        # Create Category if not exists
        if category_name not in categories_map:
            categories_map[category_name] = {
                "id": generate_id(),
                "name": category_name,
                "topic_ids": [],
                "total_posts": 0,
                "sentiment_sum": 0.0,
                "total_engagement": 0.0
            }
            
        category = categories_map[category_name]
        topic_data["category_id"] = category["id"]
        
        # Update Category Stats
        category["topic_ids"].append(topic_data["id"])
        category["total_posts"] += topic_data["post_count"]
        category["sentiment_sum"] += topic_data["sentiment_sum"]
        category["total_engagement"] += topic_data["engagement_score"]
        
        final_topics.append({
            "id": topic_data["id"],
            "name": topic_data["name"],
            "category_id": topic_data["category_id"],
            "post_count": topic_data["post_count"],
            "engagement_score": topic_data["engagement_score"],
            "avg_sentiment": topic_data["avg_sentiment"]
        })

    # Finalize Categories
    final_categories = []
    for cat_name, cat_data in categories_map.items():
        if cat_data["total_posts"] > 0:
            avg_sent = cat_data["sentiment_sum"] / cat_data["total_posts"]
            # Relevance Score: Average Engagement per Post
            relevance_score = cat_data["total_engagement"] / cat_data["total_posts"]
        else:
            avg_sent = 0.0
            relevance_score = 0.0
            
        final_categories.append({
            "id": cat_data["id"],
            "name": cat_data["name"],
            "topic_count": len(cat_data["topic_ids"]),
            "total_posts": cat_data["total_posts"],
            "avg_sentiment": avg_sent,
            "relevance_score": relevance_score
        })
        
    # Format final Posts output
    final_posts = []
    for p in assigned_posts:
        final_posts.append({
            "id": p["id"],
            "topic_id": p["topic_id"],
            "text": p["original_text"],
            "sentiment_score": p["sentiment_score"],
            "posted_at": p["created_at"],
            "engagement_score": p["engagement_score"],
            "likes": p["likes"],
            "reposts": p["reposts"]
        })
    
    logger.info("Pipeline execution completed.")
    
    return {
        "categories": final_categories,
        "topics": final_topics,
        "posts": final_posts
    }
