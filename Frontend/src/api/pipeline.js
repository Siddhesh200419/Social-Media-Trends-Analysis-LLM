
const CATEGORY_META = {
  "Technology": { color: "#3b82f6", icon: "Cpu" },
  "Politics": { color: "#ef4444", icon: "Landmark" },
  "Entertainment": { color: "#8b5cf6", icon: "Film" },
  "Sports": { color: "#f59e0b", icon: "Trophy" },
  "Business": { color: "#10b981", icon: "TrendingUp" },
  "Health": { color: "#ec4899", icon: "Heart" },
  "Other": { color: "#64748b", icon: "Hash" }
};

export const fetchPipelineData = async (query = "news") => {
  const response = await fetch(`/pipeline/run?limit=300&query=${encodeURIComponent(query)}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch pipeline data');
  }
  
  const data = await response.json();
  
  // Create a map of Category ID to Name for easier lookup
  const categoryMap = {};
  data.categories.forEach(c => categoryMap[c.id] = c.name);

  // Group posts by topic_id for sentiment distribution
  const postsByTopic = {};
  data.posts.forEach(p => {
    if (!postsByTopic[p.topic_id]) postsByTopic[p.topic_id] = [];
    postsByTopic[p.topic_id].push(p);
  });

  // Transform Categories
  const categories = data.categories.map(cat => {
    const meta = CATEGORY_META[cat.name] || CATEGORY_META["Other"];
    return {
      ...cat,
      total_tweets: cat.total_posts, // Map to frontend expected field
      icon: meta.icon,
      color: meta.color,
      description: `Analysis of ${cat.name} trends`,
      // relevance_score and avg_sentiment are already present
    };
  });

  // Transform Topics
  const topics = data.topics.map(topic => {
    const catName = categoryMap[topic.category_id] || "General";
    
    // Calculate sentiment distribution
    const topicPosts = postsByTopic[topic.id] || [];
    const dist = { extreme_negative: 0, negative: 0, neutral: 0, positive: 0, extreme_positive: 0 };
    topicPosts.forEach(p => {
       const s = p.sentiment_score;
       if (s >= 2) dist.extreme_positive++;
       else if (s >= 1) dist.positive++;
       else if (s === 0) dist.neutral++;
       else if (s <= -2) dist.extreme_negative++;
       else dist.negative++;
    });

    return {
      ...topic,
      total_tweets: topic.post_count,
      total_likes: topic.engagement_score, // Approx mapping
      total_retweets: 0,
      total_replies: 0,
      trend_duration: "24h",
      is_rising: topic.engagement_score > 5, // Simple threshold
      description: `Viral topic in ${catName}`,
      relevance_score: topic.engagement_score, // Map engagement to relevance for topics
      sentiment_distribution: dist
    };
  });

  // Transform Posts
  const posts = data.posts.map(post => {
    return {
      ...post,
      content: post.text,
      likes: Math.floor(post.engagement_score / 2), // Rough approximation since we only have engagement
      retweets: Math.floor(post.engagement_score / 4), // Rough approximation
      replies: 0,
      author_name: "Bluesky User",
      author_handle: "@bluesky.user",
      author_avatar: `https://ui-avatars.com/api/?name=Bluesky+User&background=random`,
      author_verified: false,
    };
  });

  return { categories, topics, posts };
};
