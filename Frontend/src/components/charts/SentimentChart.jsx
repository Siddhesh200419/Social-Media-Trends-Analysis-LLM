import React from 'react';
import { Card } from "../../components/ui/card.jsx";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { cn } from "@/lib/utils";

export default function SentimentChart({ distribution, type = "bar", title = "Sentiment Distribution" }) {
  if (!distribution) return null;

  const data = [
    { name: 'Extreme Negative', value: distribution.extreme_negative || 0, color: '#EF4444', shortName: 'Ext -' },
    { name: 'Negative', value: distribution.negative || 0, color: '#F97316', shortName: 'Neg' },
    { name: 'Neutral', value: distribution.neutral || 0, color: '#94A3B8', shortName: 'Neu' },
    { name: 'Positive', value: distribution.positive || 0, color: '#22C55E', shortName: 'Pos' },
    { name: 'Extreme Positive', value: distribution.extreme_positive || 0, color: '#10B981', shortName: 'Ext +' }
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white/95 backdrop-blur-sm shadow-xl rounded-lg p-3 border border-slate-100">
          <p className="font-semibold text-slate-900">{item.name}</p>
          <p className="text-sm text-slate-600">
            {item.value.toLocaleString()} tweets ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (type === "pie") {
    return (
      <Card className="border-0 bg-white shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom"
                formatter={(value, entry) => (
                  <span className="text-sm text-slate-600">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-white shadow-sm p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30 }}>
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
            <YAxis 
              type="category" 
              dataKey="shortName" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 8, 8, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-2 mt-4 pt-4 border-t border-slate-100">
        {data.map((item) => (
          <div key={item.name} className="text-center">
            <div 
              className="w-3 h-3 rounded-full mx-auto mb-1"
              style={{ backgroundColor: item.color }}
            />
            <p className="text-xs font-medium text-slate-600">{item.shortName}</p>
            <p className="text-sm font-bold text-slate-900">
              {total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}