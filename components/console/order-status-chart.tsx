"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type OrderStatusDataPoint = {
  status: string;
  count: number;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "oklch(0.75 0.15 85)",
  SHIPPED: "oklch(0.55 0.2 275)",
  DELIVERED: "oklch(0.65 0.18 155)",
  CANCELLED: "oklch(0.58 0.22 25)",
};

type OrderStatusChartProps = {
  data: OrderStatusDataPoint[];
  title?: string;
  className?: string;
};

export function OrderStatusChart({
  data,
  title = "Orders by Status",
  className,
}: OrderStatusChartProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={STATUS_COLORS[entry.status] ?? "oklch(0.5 0.02 260)"}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.625rem",
                }}
              />
              <Legend
                verticalAlign="bottom"
                formatter={(value) =>
                  String(value).charAt(0) + String(value).slice(1).toLowerCase()
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
