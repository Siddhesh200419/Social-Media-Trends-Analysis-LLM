import re
import emoji

def clean_text(text: str) -> str:
    """
    Cleans the input text by removing URLs, special characters, and converting to lowercase.
    """
    if not text:
        return ""
    
    # Remove URLs
    text = re.sub(r'http\S+', '', text)
    
    # Demojize
    text = emoji.demojize(text)
    
    # Remove special characters (keep alphanumeric and basic punctuation)
    # This is a basic cleaner, might need adjustment based on requirements
    text = re.sub(r'[^\w\s]', '', text)
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text.lower()
