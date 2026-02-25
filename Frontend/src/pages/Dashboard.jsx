import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, Hash, MessageSquare, BarChart3, RefreshCw, Sparkles, Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { fetchPipelineData } from "@/api/pipeline";

import StatsCard from "@/components/dashboard/StatsCard";
import CategoryCard from "@/components/dashboard/CategoryCard";
import TopicCard from "@/components/dashboard/TopicCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('query') || 'news';
  const [selectedQuery, setSelectedQuery] = useState(initialQuery);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['pipeline', selectedQuery],
    queryFn: () => fetchPipelineData(selectedQuery),
  });

  const categories = data?.categories || [];
  const topics = data?.topics || [];
  const loadingCategories = isLoading;
  const loadingTopics = isLoading;

  const totalTweets = categories.reduce((sum, cat) => sum + (cat.total_tweets || 0), 0);
  const avgSentimentRaw = categories.length > 0 
    ? (categories.reduce((sum, cat) => sum + (cat.avg_sentiment || 0), 0) / categories.length)
    : 0;
  const avgSentiment = avgSentimentRaw.toFixed(2);
  const risingTopics = topics.filter(t => t.is_rising).length;

  const [prev, setPrev] = useState({ totalTweets: 0, avgSentiment: 0, topics: 0, rising: 0 });
  useEffect(() => {
    setPrev(p => ({ totalTweets: totalTweets, avgSentiment: avgSentimentRaw, topics: topics.length, rising: risingTopics }));
  }, [totalTweets, avgSentimentRaw, topics.length, risingTopics]);

  const deltaTweets = totalTweets - prev.totalTweets;
  const deltaTopics = topics.length - prev.topics;
  const sentimentLabel = avgSentimentRaw > 0 ? "Positive" : (avgSentimentRaw < 0 ? "Negative" : "Neutral");

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Trend Pulse
              </h1>
            </div>
            <p className="text-slate-500 text-lg">
              Real-time social media trend analysis powered by AI
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {['news','tech','sports','politics','business'].map(q => (
                <Button
                  key={q}
                  variant={selectedQuery === q ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedQuery(q)}
                >
                  {q.charAt(0).toUpperCase() + q.slice(1)}
                </Button>
              ))}
            </div>
            <Link to={createPageUrl("Search") + `?query=${encodeURIComponent(selectedQuery)}`}>
              <Input
                placeholder="Search trends..."
                className="w-64 bg-white border-slate-200 focus:border-indigo-500 cursor-pointer"
                readOnly
              />
            </Link>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleRefresh}
              className="border-slate-200 hover:bg-slate-50"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <StatsCard
            title="Total Tweets"
            value={totalTweets}
            icon={MessageSquare}
            trend={`${deltaTweets > 0 ? '+' : ''}${deltaTweets}`}
            trendUp={deltaTweets > 0}
            color="indigo"
          />
          <StatsCard
            title="Avg Sentiment"
            value={avgSentiment}
            icon={Heart}
            trend={sentimentLabel}
            trendUp={avgSentimentRaw > 0}
            color="rose"
          />
          <StatsCard
            title="Active Trends"
            value={topics.length}
            icon={Hash}
            trend={`${deltaTopics > 0 ? '+' : ''}${deltaTopics}`}
            trendUp={deltaTopics > 0}
            color="emerald"
          />
          <StatsCard
            title="Rising Topics"
            value={risingTopics}
            icon={TrendingUp}
            trend={`${risingTopics} rising`}
            trendUp={risingTopics > 0}
            color="amber"
          />
        </motion.div>

        {/* Categories Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              Topic Categories
            </h2>
          </div>
          
          {loadingCategories ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <Skeleton key={n} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <CategoryCard key={category.id} category={category} index={index} query={selectedQuery} />
              ))}
            </div>
          )}
        </div>

        {/* Trending Topics */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              Trending Now
            </h2>
          </div>

          {loadingTopics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <Skeleton key={n} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topics.map((topic, index) => (
                <TopicCard key={topic.id} topic={topic} index={index} query={selectedQuery} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
