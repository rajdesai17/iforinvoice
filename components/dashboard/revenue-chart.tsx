"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface RevenueChartProps {
  data: Array<{
    month: string;
    monthNum: number;
    revenue: string;
  }>;
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function RevenueChart({ data }: RevenueChartProps) {
  // Fill in missing months with 0 revenue
  const currentMonth = new Date().getMonth();
  const chartData = months.slice(0, currentMonth + 1).map((month, index) => {
    const found = data.find((d) => d.monthNum === index + 1);
    return {
      month,
      revenue: found ? parseFloat(found.revenue) : 0,
    };
  });

  const hasData = chartData.some((d) => d.revenue > 0);

  return (
    <div className="rounded-xl bg-[#111113] border border-[#1e1e21] overflow-hidden">
      <div className="p-4 border-b border-[#1e1e21]">
        <h3 className="text-sm font-semibold text-primary">Revenue Overview</h3>
        <p className="text-xs text-[#6b7280] mt-0.5">Monthly revenue from paid invoices</p>
      </div>
      <div className="p-4">
        {!hasData ? (
          <div className="flex items-center justify-center h-[200px] text-[#6b7280]">
            No revenue data yet
          </div>
        ) : (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickMargin={8}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(value) => `$${value}`}
                  width={60}
                  tick={{ fill: '#6b7280' }}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                  contentStyle={{
                    backgroundColor: "#111113",
                    border: "1px solid #1e1e21",
                    borderRadius: "8px",
                    color: "#ffffff",
                  }}
                  labelStyle={{ color: '#9ca3af' }}
                  cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
