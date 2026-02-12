from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import logging

logger = logging.getLogger(__name__)

class TopicSummarizer:
    def __init__(self):
        # Using T5-small for efficiency and low memory footprint
        try:
            model_name = "t5-small"
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
            logger.info("Topic summarizer loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load summarizer: {e}")
            self.tokenizer = None
            self.model = None

    def summarize(self, texts):
        if not self.model or not self.tokenizer or not texts:
            return "No summary available."

        # Combine texts
        combined_text = "summarize: " + " ".join(texts)
        if len(combined_text) > 1024:
            combined_text = combined_text[:1024]

        try:
            inputs = self.tokenizer(combined_text, return_tensors="pt", max_length=1024, truncation=True)
            # Generate summary
            summary_ids = self.model.generate(
                inputs["input_ids"], 
                max_length=60, 
                min_length=10, 
                do_sample=False,
                early_stopping=True
            )
            summary = self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
            return summary
        except Exception as e:
            logger.error(f"Error summarizing topic: {e}")
            return "Summary generation failed."
