import React from 'react';
import { Card } from "../../components/ui/card.jsx";
import { cn } from "@/lib/utils";

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, trendUp, color = "indigo" }) {
  const colorClasses = {
    indigo: "from-indigo-500 to-indigo-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    rose: "from-rose-500 to-rose-600",
    violet: "from-violet-500 to-violet-600"
  };

  return (
    <Card className="relative overflow-hidden border-0 bg-white shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500 tracking-wide uppercase">{title}</p>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-sm text-slate-500">{subtitle}</p>
            )}
            {trend && (
              <div className={cn(
                "inline-flex items-center gap-1 text-sm font-medium rounded-full px-2 py-0.5",
                trendUp ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
              )}>
                <span>{trendUp ? "↑" : "↓"}</span>
                <span>{trend}</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn(
              "p-3 rounded-xl bg-gradient-to-br shadow-lg",
              colorClasses[color]
            )}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
      </div>
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r",
        colorClasses[color]
      )} />
    </Card>
  );
}