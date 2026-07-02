"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Point {
  label: string;
  created: number;
  completed: number;
}

export function ActivityChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="created" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(263 70% 60%)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="hsl(263 70% 60%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="completed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(160 70% 45%)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="hsl(160 70% 45%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 16%)" vertical={false} />
        <XAxis
          dataKey="label"
          stroke="hsl(240 5% 55%)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(240 5% 55%)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={32}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(240 8% 7%)",
            border: "1px solid hsl(240 5% 16%)",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "hsl(0 0% 98%)" }}
        />
        <Area
          type="monotone"
          dataKey="created"
          name="Created"
          stroke="hsl(263 70% 60%)"
          fill="url(#created)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="completed"
          name="Completed"
          stroke="hsl(160 70% 45%)"
          fill="url(#completed)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
