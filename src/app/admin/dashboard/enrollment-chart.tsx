"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer } from "@/components/charts/chart-container";

export function EnrollmentChart({ data }: { data: { course: string; students: number }[] }) {
  const fallback = (
    <table className="w-full min-w-[300px] border-collapse text-sm">
      <caption className="sr-only">Active student enrollment by course</caption>
      <thead>
        <tr className="border-b border-border">
          <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Course</th>
          <th scope="col" className="px-3 py-2 text-right font-medium text-muted-foreground">Students</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d) => (
          <tr key={d.course} className="border-b border-border last:border-0">
            <td className="px-3 py-2 text-foreground">{d.course}</td>
            <td className="px-3 py-2 text-right text-foreground">{d.students}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <ChartContainer
      title="Active student enrollment by course"
      fallback={fallback}
      chart={
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="course" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }} />
            <Bar dataKey="students" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      }
    />
  );
}
