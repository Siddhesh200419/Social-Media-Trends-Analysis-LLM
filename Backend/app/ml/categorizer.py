from transformers import pipeline
import logging

logger = logging.getLogger(__name__)

class Categorizer:
    def __init__(self):
        # Zero-shot classification for topic categorization
        # Using a smaller model to ensure it runs in the environment
        try:
            self.classifier = pipeline("zero-shot-classification", model="valhalla/distilbart-mnli-12-1")
            logger.info("Categorizer loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load categorizer: {e}")
            self.classifier = None
        
        self.categories = [
            "Technology", "Politics", "Sports", "Entertainment", 
            "Finance", "Science", "Travel", "Food", "Lifestyle", "General"
        ]

    def categorize(self, text):
        if not self.classifier or not text:
            return "General"

        try:
            result = self.classifier(text, candidate_labels=self.categories)
            # result['labels'][0] is the top category
            return result['labels'][0]
        except Exception as e:
            logger.error(f"Error classifying topic: {e}")
            return "General"
