from atproto import Client
from dotenv import load_dotenv
import os

load_dotenv()

def get_client():
    handle = os.getenv("BSKY_HANDLE")
    password = os.getenv("BSKY_APP_PASSWORD")

    if not handle or not password:
        raise ValueError("Bluesky credentials not found in .env")

    client = Client()
    client.login(handle, password)
    return client


def fetch_public_posts(limit=100, query="tech"):
    client = get_client()

    posts = []
    cursor = None
    max_iterations = 10  # Prevent infinite loops
    per_page = min(100, limit)  # Bluesky API limit is 100 per request
    
    for iteration in range(max_iterations):
        if len(posts) >= limit:
            break
        
        try:
            # Use search_posts for broader trend analysis
            params = {'q': query, 'limit': per_page}
            if cursor:
                params['cursor'] = cursor
            
            search_res = client.app.bsky.feed.search_posts(params=params)
            
            if not search_res or not hasattr(search_res, 'posts') or not search_res.posts:
                break
            
            for post in search_res.posts:
                if len(posts) >= limit:
                    break
                try:
                    record = post.record
                    # Check if record has text (it might be an image post or other type)
                    text = getattr(record, 'text', '')
                    if not text:
                        continue
                        
                    posts.append({
                        "text": text,
                        "created_at": getattr(record, 'created_at', ''),
                        "likes": post.like_count or 0,
                        "reposts": post.repost_count or 0
                    })
                except Exception as e:
                    # Skip posts that can't be parsed
                    continue
            
            # Get cursor for next page
            cursor = getattr(search_res, 'cursor', None)
            if not cursor:
                break
                
        except Exception as e:
            # If pagination fails, just return what we have
            print(f"Error during pagination: {e}")
            break

    return posts[:limit]
