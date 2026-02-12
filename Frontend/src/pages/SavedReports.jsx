import React, { useState } from 'react';
// import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, FileText, Trash2, Download, Calendar, TrendingUp, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import moment from "moment";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SavedReports() {
  // Saved reports functionality not implemented yet - using empty array
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['savedReports'],
    queryFn: async () => {
      // Return empty array for now - saved reports feature not implemented
      return [];
    },
  });

  const deleteReportMutation = {
    mutate: (reportId) => {
      toast.info('Delete functionality not implemented yet');
    }
  };

  const exportToPDF = (report) => {
    // Create printable content
    const content = `
      <html>
        <head>
          <title>${report.topic_name} - Trend Report</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #1e293b; margin-bottom: 8px; }
            h2 { color: #475569; font-size: 18px; margin-top: 32px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
            .meta { color: #64748b; margin-bottom: 24px; }
            .stat { display: inline-block; margin-right: 24px; padding: 12px 16px; background: #f8fafc; border-radius: 8px; }
            .stat-label { color: #64748b; font-size: 12px; text-transform: uppercase; }
            .stat-value { color: #1e293b; font-size: 24px; font-weight: bold; }
            .summary { background: #f8fafc; padding: 20px; border-radius: 8px; line-height: 1.6; }
            .tweet { border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin-bottom: 12px; }
            .tweet-author { font-weight: 600; color: #1e293b; }
            .tweet-likes { color: #ef4444; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>${report.topic_name}</h1>
          <p class="meta">Category: ${report.category_name} | Saved on ${moment(report.saved_at || report.created_date).format('MMMM D, YYYY')}</p>
          
          <div style="margin: 24px 0;">
            <div class="stat">
              <div class="stat-label">Relevance Score</div>
              <div class="stat-value">${report.report_data?.relevance_score?.toFixed(1) || 'N/A'}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Avg Sentiment</div>
              <div class="stat-value">${report.report_data?.avg_sentiment?.toFixed(2) || 'N/A'}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Duration</div>
              <div class="stat-value">${report.report_data?.trend_duration || 'N/A'}</div>
            </div>
          </div>
          
          <h2>AI Summary</h2>
          <div class="summary">${report.ai_summary}</div>
          
          <h2>Engagement Metrics</h2>
          <div style="margin: 16px 0;">
            <div class="stat">
              <div class="stat-label">Likes</div>
              <div class="stat-value">${(report.report_data?.engagement_metrics?.likes || 0).toLocaleString()}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Retweets</div>
              <div class="stat-value">${(report.report_data?.engagement_metrics?.retweets || 0).toLocaleString()}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Replies</div>
              <div class="stat-value">${(report.report_data?.engagement_metrics?.replies || 0).toLocaleString()}</div>
            </div>
          </div>
          
          <h2>Top Tweets</h2>
          ${(report.report_data?.top_tweets || []).map(tweet => `
            <div class="tweet">
              <div class="tweet-author">${tweet.author}</div>
              <p>${tweet.content}</p>
              <span class="tweet-likes">♥ ${tweet.likes?.toLocaleString() || 0}</span>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const getSentimentLabel = (sentiment) => {
    if (sentiment >= 1) return { label: "Very Positive", color: "bg-emerald-100 text-emerald-700" };
    if (sentiment >= 0.3) return { label: "Positive", color: "bg-green-100 text-green-700" };
    if (sentiment >= -0.3) return { label: "Neutral", color: "bg-slate-100 text-slate-700" };
    if (sentiment >= -1) return { label: "Negative", color: "bg-amber-100 text-amber-700" };
    return { label: "Very Negative", color: "bg-rose-100 text-rose-700" };
  };

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

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Saved Reports</h1>
          </div>
          <p className="text-slate-500">Your saved trend analysis reports</p>
        </motion.div>

        {/* Reports List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-600 mb-2">No saved reports yet</h2>
            <p className="text-slate-400 mb-6">Save reports from topic details to view them here</p>
            <Link to={createPageUrl("Dashboard")}>
              <Button>Explore Trends</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {reports.map((report, index) => {
                const sentiment = getSentimentLabel(report.report_data?.avg_sentiment);
                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-slate-900">{report.topic_name}</h3>
                            <Badge variant="outline">{report.category_name}</Badge>
                            <Badge className={sentiment.color}>{sentiment.label}</Badge>
                          </div>
                          <p className="text-slate-500 line-clamp-2 mb-3">{report.ai_summary}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {moment(report.saved_at || report.created_date).format('MMM D, YYYY')}
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              Score: {report.report_data?.relevance_score?.toFixed(1)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link to={createPageUrl("TopicDetail") + `?id=${report.topic_id}`}>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              View Topic
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => exportToPDF(report)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Export
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Report</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this report? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteReportMutation.mutate(report.id)}
                                  className="bg-rose-600 hover:bg-rose-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}