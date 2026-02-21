import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, MessageSquare, Cpu, Landmark, Film, Trophy, Heart, Hash } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { fetchPipelineData } from "@/api/pipeline";

import TopicCard from "@/components/dashboard/TopicCard";
import SentimentChart from "@/components/charts/SentimentChart";

const iconMap = {
  Cpu: Cpu,
  Landmark: Landmark,
  Film: Film,
  Trophy: Trophy,
  TrendingUp: TrendingUp,
  Heart: Heart,
  Hash: Hash
};

export default function CategoryDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const categoryId = urlParams.get('id');
  const selectedQuery = urlParams.get('query') || 'news';

  const { data, isLoading } = useQuery({
    queryKey: ['pipeline', selectedQuery],
    queryFn: () => fetchPipelineData(selectedQuery),
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const category = data?.categories.find(c => c.id === categoryId);
  const topics = data?.topics.filter(t => t.category_id === categoryId) || [];

  // Calculate aggregated sentiment distribution
  const aggregatedSentiment = topics.reduce((acc, topic) => {
    if (topic.sentiment_distribution) {
      acc.extreme_negative += topic.sentiment_distribution.extreme_negative || 0;
      acc.negative += topic.sentiment_distribution.negative || 0;
      acc.neutral += topic.sentiment_distribution.neutral || 0;
      acc.positive += topic.sentiment_distribution.positive || 0;
      acc.extreme_positive += topic.sentiment_distribution.extreme_positive || 0;
    }
    return acc;
  }, { extreme_negative: 0, negative: 0, neutral: 0, positive: 0, extreme_positive: 0 });

  const IconComponent = category ? iconMap[category.icon] || Hash : Hash;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Category not found</p>
          <Link to={createPageUrl("Dashboard")}>
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="ghost" className="gap-2 text-slate-600">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </motion.div>

        {/* Category Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="p-4 rounded-2xl shadow-sm"
                style={{ backgroundColor: `${category.color}15` }}
              >
                <IconComponent 
                  className="w-8 h-8" 
                  style={{ color: category.color }} 
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">
                  {category.name}
                </h1>
                <p className="text-slate-500 text-lg">
                  {category.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="flex items-center gap-2 text-slate-400 mb-1 justify-center">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium uppercase tracking-wide">Score</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {category.relevance_score?.toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 text-slate-400 mb-1 justify-center">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-medium uppercase tracking-wide">Tweets</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {category.total_tweets > 1000 
                    ? (category.total_tweets / 1000).toFixed(1) + 'K' 
                    : category.total_tweets}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Topics List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Trending Topics
              </h2>
              <span className="text-sm text-slate-500">
                {topics.length} active trends
              </span>
            </div>
            
            <div className="grid gap-4">
              {topics.map((topic, index) => (
                <TopicCard 
                  key={topic.id} 
                  topic={topic} 
                  index={index}
                  query={selectedQuery}
                />
              ))}
            </div>
          </div>

          {/* Sidebar - Sentiment Analysis */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                Sentiment Overview
              </h2>
              <SentimentChart data={aggregatedSentiment} />
              
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Average Sentiment</span>
                  <span className={`font-bold ${
                    category.avg_sentiment > 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {category.avg_sentiment > 0 ? '+' : ''}{category.avg_sentiment?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
