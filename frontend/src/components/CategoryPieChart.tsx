import { PieChart as PieChartIcon } from 'lucide-react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface Slice {
  name: string;
  total: number;
  color: string;
}

export default function CategoryPieChart({ data }: { data: Slice[] }) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <PieChartIcon size={18} />
        </div>
        <p className="text-sm text-slate-400">No expenses recorded for this period yet.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="name"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
          animationDuration={500}
        >
          {data.map((slice) => (
            <Cell key={slice.name} fill={slice.color} stroke="white" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => `$${Number(value).toFixed(2)}`}
          contentStyle={{ borderRadius: 10, borderColor: '#e2e8f0', fontSize: 13 }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
