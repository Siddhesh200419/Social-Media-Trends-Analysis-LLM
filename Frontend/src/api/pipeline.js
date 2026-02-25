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
  const response = await fetch(`/pipeline/run?limit=50&query=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch pipeline data');
  }
  const data = await response.json();
  const categoryMap = {};
  data.categories.forEach(c => categoryMap[c.id] = c.name);
  const postsByTopic = {};
  data.posts.forEach(p => {
    if (!postsByTopic[p.topic_id]) postsByTopic[p.topic_id] = [];
    postsByTopic[p.topic_id].push(p);
  });
  const maxEngagement = data.topics.reduce((m, t) => Math.max(m, t.engagement_score || 0), 1);

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

    let totalLikes = topicPosts.reduce((sum, p) => sum + (p.likes || 0), 0);
    let totalRetweets = topicPosts.reduce((sum, p) => sum + (p.reposts || 0), 0);
    if (totalLikes === 0 && totalRetweets === 0) {
      totalLikes = Math.floor((topic.engagement_score || 0) / 2);
      totalRetweets = Math.floor((topic.engagement_score || 0) / 4);
    }

    const relevance = Math.round((topic.engagement_score / maxEngagement) * 100);

    const times = topicPosts
      .map(p => p.posted_at ? new Date(p.posted_at).getTime() : null)
      .filter((t) => typeof t === 'number');
    let trendDuration = "24h";
    if (times.length > 0) {
      const minT = Math.min(...times);
      const maxT = Math.max(...times);
      const diffMs = Math.max(0, maxT - minT);
      const hrs = Math.round(diffMs / 3600000);
      trendDuration = hrs < 1 ? "<1h" : (hrs < 48 ? `${hrs}h` : `${Math.round(hrs/24)}d`);
    }

    return {
      ...topic,
      total_tweets: topic.post_count,
      total_likes: totalLikes,
      total_retweets: totalRetweets,
      total_replies: 0,
      trend_duration: trendDuration,
      is_rising: topic.engagement_score > 5,
      description: `Viral topic in ${catName}`,
      relevance_score: relevance,
      sentiment_distribution: dist
    };
  });

  // Transform Posts
  const posts = data.posts.map(post => {
    return {
      ...post,
      content: post.text,
      likes: post.likes || 0,
      retweets: post.reposts || 0,
      replies: 0,
      author_name: "Bluesky User",
      author_handle: "@bluesky.user",
      author_avatar: `https://ui-avatars.com/api/?name=Bluesky+User&background=random`,
      author_verified: false,
    };
  });

  return { categories, topics, posts };
};