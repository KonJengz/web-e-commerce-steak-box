"use client";

import type { JSX } from "react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  CartesianGrid,
} from "recharts";

import { normalizeOrderStatus } from "@/features/order/types/order-status";
import type { AdminOrderSummary } from "@/features/order/types/order.type";
import { cn } from "@/lib/utils";

/**
 * Enhanced Dashboard Analytics Components
 * Using Recharts for visual data representation.
 */

interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

interface OrderStatusChartProps {
  summary: AdminOrderSummary;
  className?: string;
}

/**
 * Order Status Breakdown (Donut Chart)
 */
export function OrderStatusChart({
  summary,
  className,
}: OrderStatusChartProps): JSX.Element {
  const data = [
    { name: "Delivered", value: summary.delivered, color: "#10b981" }, // Success Green
    { name: "Shipped", value: summary.shipped, color: "#3b82f6" }, // Info Blue
    { name: "Paid", value: summary.paid, color: "#c44b38" }, // Primary
    { name: "Review", value: summary.paymentReview, color: "#f6c168" }, // Warning Yellow
    { name: "Pending", value: summary.pending, color: "#8a7e78" }, // Muted
  ].filter((item) => item.value > 0);

  // Fallback if no data
  const chartData = data.length > 0 ? data : [{ name: "No data", value: 1, color: "#e8e2dd" }];

  return (
    <div className={cn("relative h-[240px] w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            animationBegin={0}
            animationDuration={1200}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(23, 19, 18, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              fontSize: "12px",
              color: "#fff",
            }}
            itemStyle={{ color: "#fff" }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-2xl font-bold tracking-tight text-foreground">
          {summary.all}
        </p>
        <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
          Total Orders
        </p>
      </div>
    </div>
  );
}

interface RevenueTrendProps {
  data: { date: string; amount: number }[];
  className?: string;
}

/**
 * Revenue Trend (Area Chart)
 * Used to show growth/recent activity.
 */
export function RevenueSnapshotChart({
  data,
  className,
}: RevenueTrendProps): JSX.Element {
  return (
    <div className={cn("h-[260px] w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#c44b38" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#c44b38" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8a7e78", fontSize: 10 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8a7e78", fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(23, 19, 18, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              fontSize: "12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#c44b38"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            animationBegin={200}
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface InventoryBarChartProps {
  data: { category: string; count: number; color: string }[];
  className?: string;
}

/**
 * Inventory Health by Category
 */
export function InventoryHealthChart({
  data,
  className,
}: InventoryBarChartProps): JSX.Element {
  return (
    <div className={cn("h-[240px] w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255, 255, 255, 0.05)" />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="category"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8a7e78", fontSize: 11 }}
            width={80}
          />
          <Tooltip
            cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
            contentStyle={{
              backgroundColor: "rgba(23, 19, 18, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              fontSize: "12px",
            }}
          />
          <Bar
            dataKey="count"
            radius={[0, 4, 4, 0]}
            barSize={12}
            animationBegin={400}
            animationDuration={1500}
          >
            {data.map((entry, index) => (
              <Cell key={`bar-cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
