"use client";

import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ChartContainer } from "@/components/charts/chart-container";

export function FeeProgressChart({ totalDue, totalPaid, balance }: { totalDue: number; totalPaid: number; balance: number }) {
  const data = [
    { label: "Paid", value: totalPaid },
    { label: "Balance", value: balance },
  ];

  const fallback = (
    <table className="w-full min-w-[200px] border-collapse text-sm">
      <caption className="sr-only">Fee payment progress</caption>
      <tbody>
        <tr className="border-b border-border">
          <th scope="row" className="px-3 py-2 text-left font-medium text-muted-foreground">Total Due</th>
          <td className="px-3 py-2 text-right text-foreground">₹{totalDue}</td>
        </tr>
        <tr className="border-b border-border">
          <th scope="row" className="px-3 py-2 text-left font-medium text-muted-foreground">Paid</th>
          <td className="px-3 py-2 text-right text-success">₹{totalPaid}</td>
        </tr>
        <tr>
          <th scope="row" className="px-3 py-2 text-left font-medium text-muted-foreground">Balance</th>
          <td className="px-3 py-2 text-right text-danger">₹{balance}</td>
        </tr>
      </tbody>
    </table>
  );

  return (
    <ChartContainer
      title="Fee payment progress"
      fallback={fallback}
      chart={
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={data} layout="vertical" margin={{ left: 16 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="label" width={70} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              <Cell fill="var(--success)" />
              <Cell fill="var(--danger)" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      }
    />
  );
}
