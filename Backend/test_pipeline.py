print("Starting script...")
import sys
import os
import json
from dotenv import load_dotenv

# Load env
load_dotenv()

# Add the current directory to sys.path so we can import app
sys.path.append(os.getcwd())

try:
    from app.pipeline import run_pipeline
except Exception as e:
    print(f"Import error: {e}")
    sys.exit(1)

def test():
    print("Testing pipeline...")
    
    # Check if credentials exist
    if not os.getenv("BSKY_HANDLE") or not os.getenv("BSKY_APP_PASSWORD"):
        print("WARNING: BSKY_HANDLE or BSKY_APP_PASSWORD not found in environment.")
        print("Pipeline might fail if not mocked.")
    
    print("Running pipeline...")
    try:
        results = run_pipeline(limit=10, query="tech")
        
        categories = results["categories"]
        topics = results["topics"]
        posts = results["posts"]
        
        print(f"Categories: {len(categories)}")
        print(f"Topics: {len(topics)}")
        print(f"Posts: {len(posts)}")
        
        if categories:
            print("Sample Category:", json.dumps(categories[0], default=str))
        if topics:
            print("Sample Topic:", json.dumps(topics[0], default=str))
        if posts:
            print("Sample Post Type:", type(posts[0]))
            print("Sample Post Keys:", list(posts[0].keys()))
            print("Sample Post JSON:", json.dumps(posts[0], default=str))
            
        print("Pipeline test completed successfully.")
        
    except Exception as e:
        print(f"Pipeline execution failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test()
