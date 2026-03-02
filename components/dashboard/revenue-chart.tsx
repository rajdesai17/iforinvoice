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
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-navy-door">Revenue Overview</h3>
        <p className="text-xs text-navy-harper mt-0.5">Monthly revenue from paid invoices</p>
      </div>
      <div className="p-4">
        {!hasData ? (
          <div className="flex items-center justify-center h-[200px] text-navy-harper">
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
                  tick={{ fill: '#9DB2BF' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(value) => `$${value}`}
                  width={60}
                  tick={{ fill: '#9DB2BF' }}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                  contentStyle={{
                    backgroundColor: "#28374D",
                    border: "1px solid #3a4d63",
                    borderRadius: "8px",
                    color: "#DDE6ED",
                  }}
                  labelStyle={{ color: '#9DB2BF' }}
                  cursor={{ fill: 'rgba(83, 109, 130, 0.1)' }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#536D82"
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
