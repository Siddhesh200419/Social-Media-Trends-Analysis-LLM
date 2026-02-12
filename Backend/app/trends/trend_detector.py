from collections import Counter
import re

STOPWORDS = {
    "the", "is", "are", "a", "an", "and", "or", "to", "of", "in", "on",
    "for", "with", "that", "this", "it", "as", "by", "from", "at"
}

def calculate_engagement(likes: int, reposts: int) -> int:
    """
    Calculates engagement score based on the project rule:
    Engagement = likeCount + 2 * repostCount
    """
    return likes + (2 * reposts)

def extract_keywords(text):
    words = re.findall(r"\b[a-z]{3,}\b", text.lower())
    return [w for w in words if w not in STOPWORDS]


def detect_trends(posts, top_n=10):
    hashtag_counter = Counter()
    keyword_counter = Counter()
    engagement_counter = Counter()

    for post in posts:
        text = post["text"]
        likes = post.get("likes", 0)
        reposts = post.get("reposts", 0)
        engagement = calculate_engagement(likes, reposts)

        # Hashtags
        hashtags = re.findall(r"#(\w+)", text.lower())
        for tag in hashtags:
            hashtag_counter[tag] += 1
            engagement_counter[tag] += engagement

        # Keywords
        keywords = extract_keywords(text)
        for kw in keywords:
            keyword_counter[kw] += 1
            engagement_counter[kw] += engagement

    trends = []
    combined = hashtag_counter + keyword_counter

    for item, freq in combined.items():
        # Trend Score Calculation:
        # Simple weighted frequency: Frequency + (Total Engagement / 10)
        # This gives priority to topics that are both frequent and engaging.
        score = freq + (engagement_counter[item] / 10)
        trends.append((item, round(score, 2)))

    trends.sort(key=lambda x: x[1], reverse=True)
    return trends[:top_n]
