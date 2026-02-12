import React from 'react';
import { Card } from "../../components/ui/card.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { Heart, Repeat2, MessageCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import moment from "moment";

export default function TweetCard({ tweet, index }) {
  const getSentimentConfig = (score) => {
    const configs = {
      2: { label: "Extreme Positive", color: "bg-emerald-100 text-emerald-700 border-emerald-200", emoji: "🔥" },
      1: { label: "Positive", color: "bg-green-100 text-green-700 border-green-200", emoji: "👍" },
      0: { label: "Neutral", color: "bg-slate-100 text-slate-600 border-slate-200", emoji: "😐" },
      "-1": { label: "Negative", color: "bg-amber-100 text-amber-700 border-amber-200", emoji: "👎" },
      "-2": { label: "Extreme Negative", color: "bg-rose-100 text-rose-700 border-rose-200", emoji: "💔" }
    };
    return configs[score] || configs[0];
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString();
  };

  const sentiment = getSentimentConfig(tweet.sentiment_score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
        <div className="p-5 space-y-4">
          {/* Author Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img
                src={tweet.author_avatar || `https://ui-avatars.com/api/?name=${tweet.author_name}&background=random`}
                alt={tweet.author_name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-900">{tweet.author_name}</span>
                  {tweet.author_verified && (
                    <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500" />
                  )}
                </div>
                <p className="text-sm text-slate-500">{tweet.author_handle}</p>
              </div>
            </div>
            <Badge className={cn("text-xs font-medium border", sentiment.color)}>
              {sentiment.emoji} {tweet.sentiment_label || sentiment.label}
            </Badge>
          </div>

          {/* Tweet Content */}
          <p className="text-slate-800 leading-relaxed text-[15px]">
            {tweet.content}
          </p>

          {/* Timestamp */}
          <p className="text-sm text-slate-400">
            {moment(tweet.posted_at).fromNow()}
          </p>

          {/* Engagement Stats */}
          <div className="flex items-center gap-6 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">{formatNumber(tweet.likes)}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-colors cursor-pointer">
              <Repeat2 className="w-4 h-4" />
              <span className="text-sm font-medium">{formatNumber(tweet.retweets)}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors cursor-pointer">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{formatNumber(tweet.replies)}</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}