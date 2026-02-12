import React from 'react';
import { Card } from "../../components/ui/card.jsx";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Heart, Repeat2, MessageCircle } from 'lucide-react';

export default function EngagementChart({ likes, retweets, replies, title = "Engagement Breakdown" }) {
  const data = [
    { name: 'Engagement', likes: likes || 0, retweets: retweets || 0, replies: replies || 0 }
  ];

  const total = (likes || 0) + (retweets || 0) + (replies || 0);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString();
  };

  const metrics = [
    { key: 'likes', label: 'Likes', value: likes, color: '#EF4444', icon: Heart, bgColor: 'bg-rose-50' },
    { key: 'retweets', label: 'Retweets', value: retweets, color: '#22C55E', icon: Repeat2, bgColor: 'bg-emerald-50' },
    { key: 'replies', label: 'Replies', value: replies, color: '#3B82F6', icon: MessageCircle, bgColor: 'bg-blue-50' }
  ];

  return (
    <Card className="border-0 bg-white shadow-sm p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">{title}</h3>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const percentage = total > 0 ? ((metric.value / total) * 100).toFixed(1) : 0;
          return (
            <div key={metric.key} className={`${metric.bgColor} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: metric.color }} />
                <span className="text-sm font-medium text-slate-600">{metric.label}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatNumber(metric.value)}</p>
              <p className="text-sm text-slate-500">{percentage}% of total</p>
            </div>
          );
        })}
      </div>

      {/* Stacked Bar */}
      <div className="h-16">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" hide />
            <Bar dataKey="likes" stackId="a" fill="#EF4444" radius={[8, 0, 0, 8]} />
            <Bar dataKey="retweets" stackId="a" fill="#22C55E" />
            <Bar dataKey="replies" stackId="a" fill="#3B82F6" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Total */}
      <div className="mt-4 pt-4 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-500">Total Engagements</p>
        <p className="text-3xl font-bold text-slate-900">{formatNumber(total)}</p>
      </div>
    </Card>
  );
}