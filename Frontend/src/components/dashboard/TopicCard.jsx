import React from 'react';
import { Card } from "../../components/ui/card.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { TrendingUp, Heart, Repeat2, MessageCircle, Clock, Flame, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function TopicCard({ topic, index, showCategory = false, query = 'news' }) {
  const getSentimentGradient = (sentiment) => {
    if (sentiment >= 1) return "from-emerald-500 to-teal-500";
    if (sentiment >= 0.3) return "from-emerald-400 to-emerald-500";
    if (sentiment >= -0.3) return "from-slate-400 to-slate-500";
    if (sentiment >= -1) return "from-amber-400 to-orange-500";
    return "from-rose-500 to-red-600";
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Link to={createPageUrl("TopicDetail") + `?id=${topic.id}&query=${encodeURIComponent(query)}`}>
        <Card className="group relative overflow-hidden border-0 bg-white shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer">
          {/* Rank Badge */}
          <div className="absolute top-4 left-4 z-10">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
              index < 3 
                ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg"
                : "bg-slate-100 text-slate-600"
            )}>
              {index + 1}
            </div>
          </div>

          {/* Rising Indicator */}
          {topic.is_rising && (
            <div className="absolute top-4 right-4 z-10">
              <Badge className="bg-gradient-to-r from-orange-500 to-rose-500 text-white border-0 shadow-lg">
                <Flame className="w-3 h-3 mr-1" />
                Rising
              </Badge>
            </div>
          )}

          <div className="p-6 pt-14 space-y-4">
            {/* Topic Name */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {topic.name}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-2">
                {topic.description}
              </p>
            </div>

            {/* Relevance Score */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Relevance Score
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {topic.relevance_score?.toFixed(1)}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${topic.relevance_score}%` }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full bg-gradient-to-r",
                      getSentimentGradient(topic.avg_sentiment)
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Engagement Stats */}
            <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-100">
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-rose-500">
                  <Heart className="w-4 h-4" />
                </div>
                <p className="text-sm font-semibold text-slate-900">{formatNumber(topic.total_likes)}</p>
                <p className="text-xs text-slate-400">Likes</p>
              </div>
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-emerald-500">
                  <Repeat2 className="w-4 h-4" />
                </div>
                <p className="text-sm font-semibold text-slate-900">{formatNumber(topic.total_retweets)}</p>
                <p className="text-xs text-slate-400">Retweets</p>
              </div>
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-blue-500">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <p className="text-sm font-semibold text-slate-900">{formatNumber(topic.total_replies)}</p>
                <p className="text-xs text-slate-400">Replies</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{topic.trend_duration}</span>
              </div>
              <div className="flex items-center gap-1 text-indigo-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                View Details
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
