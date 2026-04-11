"use client";

import React, { useMemo } from "react";
import { useCRM } from "@/context/CRMContext";
import { PIPELINE_STAGES } from "@/types/crm";
import { formatCurrency } from "@/lib/crm-utils";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "hsl(161,94%,30%)",
  "hsl(200,80%,50%)",
  "hsl(45,93%,47%)",
  "hsl(280,60%,50%)",
  "hsl(0,60%,50%)",
  "hsl(120,60%,40%)",
];

const Analytics: React.FC = () => {
  const { clients } = useCRM();

  const leadsPerMonth = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((m, i) => ({
      month: m,
      leads: Math.floor(Math.random() * 12) + 3 + i,
    }));
  }, []);

  const conversionByStage = useMemo(() => {
    return PIPELINE_STAGES.map((s) => ({
      stage: s.label,
      count: clients.filter((c) => c.stage === s.id).length,
    }));
  }, [clients]);

  // const leadSources = useMemo(() => {
  //   const sourceMap: Record<string, number> = {};
  //   clients.forEach((c) => {
  //     sourceMap[c.leadSource] = (sourceMap[c.leadSource] || 0) + 1;
  //   });
  //   return Object.entries(sourceMap).map(([name, value]) => ({
  //     name: name.replace("_", " "),
  //     value,
  //   }));
  // }, [clients]);

  const revenueTrend = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((m, i) => ({
      month: m,
      revenue: (Math.random() * 500000 + 100000) * (i + 1),
    }));
  }, []);

  const dealsPerMonth = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((m) => ({
      month: m,
      deals: Math.floor(Math.random() * 5) + 1,
    }));
  }, []);

  const ChartCard = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="rounded-xl bg-card p-4 card-shadow">
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Sales performance insights and trends.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <ChartCard title="Leads per Month">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={leadsPerMonth}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,.1)",
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="leads"
                fill="hsl(161,94%,30%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Conversion by Stage">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={conversionByStage} layout="vertical">
              <XAxis
                type="number"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="stage"
                type="category"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,.1)",
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="count"
                fill="hsl(200,80%,50%)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* <ChartCard title="Top Lead Sources">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={leadSources}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {leadSources.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,.1)",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2">
            {leadSources.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-[11px] text-muted-foreground capitalize">
                  {d.name} ({d.value})
                </span>
              </div>
            ))}
          </div>
        </ChartCard> */}

        <ChartCard title="Revenue Trend">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(161,94%,30%)"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(161,94%,30%)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatCurrency(v)}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,.1)",
                  fontSize: 12,
                }}
                // formatter={(v: number) => formatCurrency(v)}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(161,94%,30%)"
                strokeWidth={2}
                fill="url(#revGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Deals Closed per Month">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dealsPerMonth}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,.1)",
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="deals"
                fill="hsl(45,93%,47%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default Analytics;
