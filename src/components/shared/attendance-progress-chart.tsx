"use client";

import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ChartContainer } from "@/components/charts/chart-container";

export function AttendanceProgressChart({
  present,
  absent,
  late,
  halfDay,
}: {
  present: number;
  absent: number;
  late: number;
  halfDay: number;
}) {
  const data = [
    { label: "Present", value: present },
    { label: "Absent", value: absent },
    { label: "Late", value: late },
    { label: "Half day", value: halfDay },
  ];

  const fallback = (
    <table className="w-full min-w-[200px] border-collapse text-sm">
      <caption className="sr-only">Attendance breakdown</caption>
      <tbody>
        {data.map((d) => (
          <tr key={d.label} className="border-b border-border last:border-0">
            <th scope="row" className="px-3 py-2 text-left font-medium text-muted-foreground">{d.label}</th>
            <td className="px-3 py-2 text-right text-foreground">{d.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <ChartContainer
      title="Attendance breakdown"
      fallback={fallback}
      chart={
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data} layout="vertical" margin={{ left: 16 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="label" width={70} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              <Cell fill="var(--success)" />
              <Cell fill="var(--danger)" />
              <Cell fill="var(--warning)" />
              <Cell fill="var(--warning)" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      }
    />
  );
}
