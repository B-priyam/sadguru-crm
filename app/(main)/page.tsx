"use client";

import React, { useMemo } from "react";
import { useCRM } from "@/context/CRMContext";
import { PIPELINE_STAGES } from "@/types/crm";
import { formatCurrency } from "@/lib/crm-utils";
import KPICard from "@/components/KPICard";
import {
  Users,
  UserCheck,
  CalendarCheck,
  Handshake,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const STAGE_COLORS = [
  "hsl(161,94%,30%)",
  "hsl(200,80%,50%)",
  "hsl(45,93%,47%)",
  "hsl(280,60%,50%)",
  "hsl(161,94%,40%)",
  "hsl(120,60%,40%)",
  "hsl(0,60%,50%)",
];

const Dashboard: React.FC = () => {
  const { clients } = useCRM();

  const stats = useMemo(() => {
    const totalClients = clients.length;
    const activeLeads = clients.filter(
      (c) => !["deal_closed", "lost"].includes(c.stage),
    ).length;
    const bookingsConfirmed = clients.filter(
      (c) => c.stage === "booking_confirmed",
    ).length;
    const dealsClosed = clients.filter((c) => c.stage === "deal_closed").length;
    // const revenue = clients.reduce(
    //   (sum, c) => sum + (c.booking?.commissionEarned || 0),
    //   0,
    // );
    const conversionRate =
      totalClients > 0 ? Math.round((dealsClosed / totalClients) * 100) : 0;
    return {
      totalClients,
      activeLeads,
      bookingsConfirmed,
      dealsClosed,
      // revenue,
      conversionRate,
    };
  }, [clients]);

  const monthlyData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((m, i) => ({
      month: m,
      bookings: Math.floor(Math.random() * 8) + 2 + i,
      leads: Math.floor(Math.random() * 15) + 5 + i * 2,
    }));
  }, []);

  const pipelineData = useMemo(() => {
    return PIPELINE_STAGES.map((stage, i) => ({
      name: stage.label,
      value: clients.filter((c) => c.stage === stage.id).length,
      color: STAGE_COLORS[i],
    })).filter((d) => d.value > 0);
  }, [clients]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          You have{" "}
          {/* {clients.filter((c) => c.followUp.some((f) => !f.completed)).length}{" "} */}
          follow-ups pending today.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3">
        <KPICard
          label="Total Clients"
          value={stats.totalClients}
          icon={<Users size={18} strokeWidth={1.5} />}
        />
        <KPICard
          label="Active Leads"
          value={stats.activeLeads}
          icon={<UserCheck size={18} strokeWidth={1.5} />}
        />
        <KPICard
          label="Bookings"
          value={stats.bookingsConfirmed}
          icon={<CalendarCheck size={18} strokeWidth={1.5} />}
        />
        <KPICard
          label="Deals Closed"
          value={stats.dealsClosed}
          icon={<Handshake size={18} strokeWidth={1.5} />}
        />
        {/* <KPICard
          label="Revenue"
          value={formatCurrency(stats.revenue)}
          icon={<DollarSign size={18} strokeWidth={1.5} />}
        /> */}
        <KPICard
          label="Conversion"
          value={`${stats.conversionRate}%`}
          icon={<TrendingUp size={18} strokeWidth={1.5} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl bg-card p-4 card-shadow">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Monthly Booking Trend
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
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
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,.1)",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="bookings"
                stroke="hsl(161,94%,30%)"
                strokeWidth={2}
                fill="url(#bookingGrad)"
              />
              <Area
                type="monotone"
                dataKey="leads"
                stroke="hsl(200,80%,50%)"
                strokeWidth={1.5}
                fill="none"
                strokeDasharray="4 4"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl bg-card p-4 card-shadow">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Pipeline Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pipelineData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {pipelineData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
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
            {pipelineData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-[11px] text-muted-foreground">
                  {d.name} ({d.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
