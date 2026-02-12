import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Clock, Flame, Bookmark, Download, Heart, Repeat2, MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

import TweetCard from "@/components/dashboard/TweetCard";
import SentimentChart from "@/components/charts/SentimentChart";
import EngagementChart from "@/components/charts/EngagementChart";

import { fetchPipelineData } from "@/api/pipeline";

export default function TopicDetail() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const topicId = urlParams.get('id');
  const selectedQuery = urlParams.get('query') || 'news';
  const [isSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['pipeline', selectedQuery],
    queryFn: () => fetchPipelineData(selectedQuery),
  });

  const topic = data?.topics.find(t => t.id === topicId);
  const tweets = data?.posts.filter(p => p.topic_id === topicId) || [];
  const category = data?.categories.find(c => c.id === topic?.category_id);

  const saveReportMutation = useMutation({
    mutationFn: async () => {
      const reportData = {
        topic_id: topic.id,
        topic_name: topic.name,
        category_name: category?.name || 'Unknown',
        report_data: {
          sentiment_distribution: topic.sentiment_distribution,
          engagement_metrics: {
            likes: topic.total_likes,
            retweets: topic.total_retweets,
            replies: 0
          },
          top_tweets: tweets.slice(0, 5).map(t => ({
            content: t.content,
            author: t.author_name,
            likes: t.likes
          })),
          relevance_score: topic.relevance_score,
          avg_sentiment: topic.avg_sentiment,
          trend_duration: "24h"
        },
        ai_summary: `${topic.name} is currently trending with a relevance score of ${topic.relevance_score?.toFixed(1)}. The overall sentiment is ${topic.avg_sentiment > 0 ? 'positive' : topic.avg_sentiment < 0 ? 'negative' : 'neutral'} with ${topic.total_tweets?.toLocaleString()} tweets analyzed.`,
        saved_at: new Date().toISOString()
      };
      // Mock saving report since we don't have a backend endpoint for it yet
      // return base44.entities.SavedReport.create(reportData);
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast.success('Report saved successfully!');
      // queryClient.invalidateQueries(['savedReports']);
    },
    onError: () => {
      toast.error('Failed to save report');
    }
  });

  const handleSaveReport = async () => {
    setIsSaving(true);
    await saveReportMutation.mutateAsync();
    setIsSaving(false);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading topic...</p>
        </div>
      </div>
    );
  }

  if (!topic) {

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <p className="text-slate-500 mb-2 text-lg font-medium">Topic not found</p>
          <p className="text-slate-400 mb-6 text-sm">The topic with ID "{topicId}" could not be found. It may have been removed or the ID is incorrect.</p>
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
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </motion.div>

        {/* Topic Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-8 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                {topic.is_rising && (
                  <Badge className="bg-gradient-to-r from-orange-500 to-rose-500 text-white border-0">
                    <Flame className="w-3 h-3 mr-1" />
                    Rising
                  </Badge>
                )}
                {category && (
                  <Badge variant="outline" className="text-slate-600">
                    {category.name}
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-3">{topic.name}</h1>
              <p className="text-lg text-slate-500">{topic.description}</p>
              
              <div className="flex items-center gap-6 mt-6">
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span>Relevance: 24h</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <TrendingUp className="w-4 h-4" />
                  <span>Score: {topic.relevance_score?.toFixed(1)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleSaveReport}
                disabled={isSaving}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
              >
                <Bookmark className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Report'}
              </Button>
              <Link to={createPageUrl("SavedReports")}>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  View Saved
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-100">
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">Tweet Volume</p>
              <p className="text-2xl font-bold text-slate-900">{formatNumber(topic.total_tweets)}</p>
            </div>
            <div className="text-center p-4 bg-rose-50 rounded-xl">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Heart className="w-4 h-4 text-rose-500" />
                <p className="text-sm text-slate-500">Likes</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatNumber(topic.total_likes)}</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-xl">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Repeat2 className="w-4 h-4 text-emerald-500" />
                <p className="text-sm text-slate-500">Retweets</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatNumber(topic.total_retweets)}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center justify-center gap-1 mb-1">
                <MessageCircle className="w-4 h-4 text-blue-500" />
                <p className="text-sm text-slate-500">Replies</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">0</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <div className="lg:col-span-1 space-y-6">
            <SentimentChart 
              distribution={topic.sentiment_distribution} 
              title="Sentiment Analysis"
              type="bar"
            />
            <EngagementChart
              likes={topic.total_likes}
              retweets={topic.total_retweets}
              replies={0}
              title="Engagement Metrics"
            />
          </div>

          {/* Tweets Section */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Top Tweets
            </h2>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-40 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : tweets.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-white rounded-xl">
                No tweets found for this topic
              </div>
            ) : (
              <div className="space-y-4">
                {tweets.map((tweet, index) => (
                  <TweetCard key={tweet.id} tweet={tweet} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
