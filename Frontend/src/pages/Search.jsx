import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, ArrowLeft, Filter, X, SlidersHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { fetchPipelineData } from "@/api/pipeline";

import TopicCard from "@/components/dashboard/TopicCard";
import CategoryCard from "@/components/dashboard/CategoryCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [selectedQuery, setSelectedQuery] = useState('news');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading } = useQuery({
    queryKey: ['pipeline', selectedQuery],
    queryFn: () => fetchPipelineData(selectedQuery),
  });

  const categories = data?.categories || [];
  const allTopics = data?.topics || [];

  // Filter and sort topics
  const filteredTopics = allTopics.filter(topic => {
    const matchesSearch = !debouncedQuery || 
      topic.name?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      topic.description?.toLowerCase().includes(debouncedQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || topic.category_id === filterCategory;
    
    let matchesSentiment = true;
    if (sentimentFilter === 'positive') matchesSentiment = topic.avg_sentiment > 0.3;
    if (sentimentFilter === 'negative') matchesSentiment = topic.avg_sentiment < -0.3;
    if (sentimentFilter === 'neutral') matchesSentiment = topic.avg_sentiment >= -0.3 && topic.avg_sentiment <= 0.3;
    
    return matchesSearch && matchesCategory && matchesSentiment;
  }).sort((a, b) => {
    if (sortBy === 'relevance') return (b.relevance_score || 0) - (a.relevance_score || 0);
    if (sortBy === 'engagement') return (b.engagement_score || 0) - (a.engagement_score || 0);
    if (sortBy === 'tweets') return (b.total_tweets || 0) - (a.total_tweets || 0);
    if (sortBy === 'sentiment') return (b.avg_sentiment || 0) - (a.avg_sentiment || 0);
    return 0;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setFilterCategory('all');
    setSentimentFilter('all');
    setSortBy('relevance');
  };

  const hasActiveFilters = filterCategory !== 'all' || sentimentFilter !== 'all' || searchQuery;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link to={createPageUrl("Dashboard") + `?query=${encodeURIComponent(selectedQuery)}`}>
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </motion.div>

        {/* Search Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-8"
        >
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Search & Explore Trends</h1>
          
          {/* Search Input */}
          <div className="relative mb-6">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search topics, hashtags, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-slate-50 border-slate-200 focus:border-indigo-500 rounded-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-slate-500">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
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
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40 bg-slate-50">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-40 bg-slate-50">
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiment</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 bg-slate-50">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="tweets">Tweet Volume</SelectItem>
                <SelectItem value="sentiment">Sentiment</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="text-slate-500 hover:text-slate-700">
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-500">
              {isLoading ? 'Searching...' : `${filteredTopics.length} topics found`}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="text-center py-16">
              <SearchIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-xl font-medium text-slate-600 mb-2">No topics found</p>
              <p className="text-slate-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredTopics.map((topic, index) => (
                  <TopicCard key={topic.id} topic={topic} index={index} query={selectedQuery} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
