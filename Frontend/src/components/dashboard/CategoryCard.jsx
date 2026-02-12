import React from 'react';
import { Card } from "../../components/ui/card.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { TrendingUp, MessageSquare, ArrowRight, Cpu, Landmark, Film, Trophy, Heart, Hash } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const iconMap = {
  Cpu: Cpu,
  Landmark: Landmark,
  Film: Film,
  Trophy: Trophy,
  TrendingUp: TrendingUp,
  Heart: Heart,
  Hash: Hash
};

export default function CategoryCard({ category, index, query = 'news' }) {
  const IconComponent = iconMap[category.icon] || Hash;
  
  const getSentimentColor = (sentiment) => {
    if (sentiment >= 1) return "text-emerald-600 bg-emerald-50";
    if (sentiment >= 0.3) return "text-emerald-500 bg-emerald-50";
    if (sentiment >= -0.3) return "text-slate-500 bg-slate-100";
    if (sentiment >= -1) return "text-amber-600 bg-amber-50";
    return "text-rose-600 bg-rose-50";
  };

  const getSentimentLabel = (sentiment) => {
    if (sentiment >= 1) return "Very Positive";
    if (sentiment >= 0.3) return "Positive";
    if (sentiment >= -0.3) return "Neutral";
    if (sentiment >= -1) return "Negative";
    return "Very Negative";
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
      transition={{ delay: index * 0.1 }}
    >
      <Link to={createPageUrl("CategoryDetail") + `?id=${category.id}&query=${encodeURIComponent(query)}`}>
        <Card className="group relative overflow-hidden border-0 bg-white shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${category.color}15` }}
                >
                  <IconComponent 
                    className="w-6 h-6" 
                    style={{ color: category.color }} 
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">
                    {category.description}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all duration-300" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium uppercase tracking-wide">Score</span>
                </div>
                <p className="text-xl font-bold text-slate-900">
                  {category.relevance_score?.toFixed(1)}
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium uppercase tracking-wide">Tweets</span>
                </div>
                <p className="text-xl font-bold text-slate-900">
                  {formatNumber(category.total_tweets)}
                </p>
              </div>
              
              <div className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Sentiment</span>
                <Badge className={cn(
                  "text-xs font-medium",
                  getSentimentColor(category.avg_sentiment)
                )}>
                  {getSentimentLabel(category.avg_sentiment)}
                </Badge>
              </div>
            </div>

            {/* Topics Badge */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                {category.topic_count} trending topics
              </Badge>
            </div>
          </div>

          {/* Bottom Accent */}
          <div 
            className="h-1 w-full opacity-80"
            style={{ backgroundColor: category.color }}
          />
        </Card>
      </Link>
    </motion.div>
  );
}
