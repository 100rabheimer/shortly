import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatShortDate } from '../utils/dates';

export default function ClicksChart({ data = [] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 12, left: -18, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            stroke="#6b7280"
            tickFormatter={(value) => formatShortDate(value)}
            fontSize={12}
          />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} stroke="#6b7280" fontSize={12} />
          <Tooltip
            cursor={{ fill: '#eff6ff' }}
            formatter={(value) => [value, 'Clicks']}
            labelFormatter={(label) => formatShortDate(label)}
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: 'none',
            }}
          />
          <Bar dataKey="clicks" fill="#2563eb" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
