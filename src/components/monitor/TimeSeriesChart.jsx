import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { VARIABLES, formatValue, formatTimestamp } from '@/lib/exportUtils';

const SERIES_GROUPS = [
  { label: 'Temperaturas', keys: ['T1', 'T2', 'T3'] },
  { label: 'Corrientes', keys: ['I1', 'I2', 'I3'] },
  { label: 'Presión', keys: ['P'] },
];

export default function TimeSeriesChart({ dataPoints }) {
  const [activeGroup, setActiveGroup] = useState(0);

  const group = SERIES_GROUPS[activeGroup];
  // Last 300 points
  const display = dataPoints.slice(-300);

  const formatY = (val, key) => {
    if (!key) return val;
    if (key === 'P') return val?.toExponential(1);
    return Number(val).toFixed(1);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded p-2 text-xs font-mono shadow-xl">
        <div className="text-muted-foreground mb-1">{formatTimestamp(label)}</div>
        {payload.map(p => (
          <div key={p.dataKey} style={{ color: p.color }}>
            {VARIABLES[p.dataKey]?.label}: {formatValue(p.dataKey, p.value)}
            <span className="text-muted-foreground ml-1">{VARIABLES[p.dataKey]?.unit}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Series de Tiempo</span>
        <div className="flex gap-1">
          {SERIES_GROUPS.map((g, i) => (
            <button
              key={g.label}
              onClick={() => setActiveGroup(i)}
              className="px-3 py-1 text-xs font-mono rounded transition-all"
              style={{
                backgroundColor: activeGroup === i ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                color: activeGroup === i ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
              }}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={display} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTimestamp}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          />
          <YAxis
            tickFormatter={(v) => group.keys[0] === 'P' ? v?.toExponential(0) : Number(v).toFixed(0)}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono', paddingTop: 8 }}
            formatter={(value) => VARIABLES[value]?.label}
          />
          {group.keys.map(k => (
            <Line
              key={k}
              type="monotone"
              dataKey={k}
              stroke={VARIABLES[k].color}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, fill: VARIABLES[k].color }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}