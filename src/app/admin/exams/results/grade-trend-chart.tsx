"use client";

import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer } from "@/components/charts/chart-container";

const LINE_COLORS = [
  "var(--primary)",
  "var(--gold-strong)",
  "var(--success)",
  "var(--danger)",
  "var(--primary-hover)",
  "var(--warning)",
];

type TrendRow = { examName: string } & Record<string, number | string | Date>;

export function GradeTrendChart({ rows, courseNames }: { rows: TrendRow[]; courseNames: string[] }) {
  const fallback = (
    <table className="w-full min-w-[400px] border-collapse text-sm">
      <caption className="sr-only">Average percentage scored per exam, by class</caption>
      <thead>
        <tr className="border-b border-border">
          <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Exam</th>
          {courseNames.map((c) => (
            <th key={c} scope="col" className="px-3 py-2 text-right font-medium text-muted-foreground">{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.examName} className="border-b border-border last:border-0">
            <td className="px-3 py-2 text-foreground">{r.examName}</td>
            {courseNames.map((c) => (
              <td key={c} className="px-3 py-2 text-right text-foreground">
                {typeof r[c] === "number" ? `${r[c]}%` : "—"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <ChartContainer
      title="Average percentage scored per exam, by class"
      fallback={fallback}
      chart={
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="examName" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}
              formatter={(value) => `${value}%`}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {courseNames.map((courseName, i) => (
              <Line
                key={courseName}
                type="monotone"
                dataKey={courseName}
                name={courseName}
                stroke={LINE_COLORS[i % LINE_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      }
    />
  );
}
