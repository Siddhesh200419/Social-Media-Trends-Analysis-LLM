from transformers import pipeline
import logging

logger = logging.getLogger(__name__)

class SentimentAnalyzer:
    def __init__(self):
        # Using a 5-class sentiment model (BERT-based) to match the [-2, 2] requirement.
        # This is a robust alternative to running Mistral 7B locally, which would require massive RAM/GPU.
        # Maps 1-5 stars to -2 to +2.
        try:
            self.analyzer = pipeline("text-classification", model="nlptown/bert-base-multilingual-uncased-sentiment")
            logger.info("Sentiment analyzer loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load sentiment analyzer: {e}")
            self.analyzer = None

    def analyze(self, text):
        if not self.analyzer or not text:
            return {"score": 0, "label": "Neutral"}

        try:
            # Truncate text to 512 tokens to avoid errors
            result = self.analyzer(text[:512])[0]
            label = result['label'] # e.g., "1 star", "5 stars"
            score = float(result['score']) # Confidence

            # Map stars to [-2, 2]
            star = int(label.split()[0])
            mapped_score = star - 3 # 1->-2, 2->-1, 3->0, 4->1, 5->2
            
            label_map = {
                -2: "Very Negative",
                -1: "Negative",
                0: "Neutral",
                1: "Positive",
                2: "Very Positive"
            }
            
            return {
                "score": mapped_score,
                "label": label_map.get(mapped_score, "Neutral")
            }
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {e}")
            return {"score": 0, "label": "Neutral"}
