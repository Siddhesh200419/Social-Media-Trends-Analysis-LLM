from collections import Counter
import re

try:
    from nltk.corpus import stopwords as nltk_stopwords
    EN_STOP = set(nltk_stopwords.words('english'))
except Exception:
    EN_STOP = set()

STOPWORDS = EN_STOP.union({
    "the","is","are","a","an","and","or","to","of","in","on","for","with","that","this","it","as","by","from","at",
    "was","were","be","been","being","have","has","had","get","got","but","other","his","her","their","our","your","you","they","them","he","she","we","i",
    "who","whom","which","what","where","when","why","how","also","about","into","over","under","out","up","down","again","more","most","some","any","each","few","many","much","very",
    "can","could","should","would","may","might","must","do","does","did","doing","will","shall","not","its","all","just"
})

def calculate_engagement(likes: int, reposts: int) -> int:
    """
    Calculates engagement score based on the project rule:
    Engagement = likeCount + 2 * repostCount
    """
    return likes + (2 * reposts)

def extract_keywords(text):
    words = re.findall(r"\b[a-z]{3,}\b", text.lower())
    return [w for w in words if w not in STOPWORDS and len(w) >= 4]


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
        if freq < 2:
            continue
        score = freq + (engagement_counter[item] / 10)
        trends.append((item, round(score, 2)))

    trends.sort(key=lambda x: x[1], reverse=True)
    return trends[:top_n]
