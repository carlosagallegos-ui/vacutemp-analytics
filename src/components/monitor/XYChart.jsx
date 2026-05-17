import React, { useState } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, ReferenceLine
} from 'recharts';
import { VARIABLES, formatValue } from '@/lib/exportUtils';

const ALL_VARS = ['T1', 'T2', 'T3', 'I1', 'I2', 'I3', 'P', 'time'];

const VarSelector = ({ label, value, onChange, exclude }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">{label}</span>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-muted border border-border rounded px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
    >
      <option value="time">Tiempo</option>
      {Object.entries(VARIABLES).filter(([k]) => k !== exclude).map(([k, v]) => (
        <option key={k} value={k}>{v.label} ({v.unit})</option>
      ))}
    </select>
  </div>
);

const CustomTooltip = ({ active, payload, xKey, yKey }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-card border border-border rounded p-2 text-xs font-mono shadow-xl">
      <div style={{ color: VARIABLES[xKey]?.color || '#aaa' }}>
        {xKey === 'time' ? 'Tiempo' : VARIABLES[xKey]?.label}: {xKey === 'time' ? new Date(d.x).toLocaleTimeString('es-MX', {hour12:false}) : formatValue(xKey, d.x)}
      </div>
      <div style={{ color: VARIABLES[yKey]?.color || '#aaa' }}>
        {VARIABLES[yKey]?.label}: {formatValue(yKey, d.y)}
      </div>
    </div>
  );
};

export default function XYChart({ dataPoints }) {
  const [xKey, setXKey] = useState('time');
  const [yKey, setYKey] = useState('T1');

  const chartData = dataPoints.map(d => ({
    x: xKey === 'time' ? d.timestamp : d[xKey],
    y: d[yKey],
    timestamp: d.timestamp,
  }));

  const yMeta = VARIABLES[yKey];
  const xMeta = xKey === 'time' ? null : VARIABLES[xKey];

  const formatX = (val) => {
    if (xKey === 'time') return new Date(val).toLocaleTimeString('es-MX', { hour12: false });
    if (xKey === 'P') return val.toExponential(1);
    return Number(val).toFixed(1);
  };

  const formatY = (val) => {
    if (yKey === 'P') return val.toExponential(1);
    return Number(val).toFixed(1);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Gráfica X-Y</span>
        <div className="flex gap-4 flex-wrap">
          <VarSelector label="Eje X" value={xKey} onChange={setXKey} exclude={yKey} />
          <VarSelector label="Eje Y" value={yKey} onChange={setYKey} exclude={xKey} />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="x"
            name={xKey}
            type="number"
            domain={['auto', 'auto']}
            tickFormatter={formatX}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            label={{
              value: xKey === 'time' ? 'Tiempo' : `${xMeta?.label} (${xMeta?.unit})`,
              position: 'insideBottom', offset: -10,
              fill: xMeta?.color || 'hsl(var(--muted-foreground))',
              fontSize: 10, fontFamily: 'JetBrains Mono'
            }}
          />
          <YAxis
            dataKey="y"
            name={yKey}
            type="number"
            domain={['auto', 'auto']}
            tickFormatter={formatY}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            label={{
              value: `${yMeta?.label} (${yMeta?.unit})`,
              angle: -90, position: 'insideLeft',
              fill: yMeta?.color,
              fontSize: 10, fontFamily: 'JetBrains Mono'
            }}
            width={60}
          />
          <Tooltip content={<CustomTooltip xKey={xKey} yKey={yKey} />} />
          <Scatter
            data={chartData}
            fill={yMeta?.color}
            opacity={0.8}
            line={{ stroke: yMeta?.color, strokeWidth: 1.5, opacity: 0.5 }}
            lineType="joint"
            shape={chartData.length > 200 ? false : undefined}
          />
        </ScatterChart>
      </ResponsiveContainer>

      {chartData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm font-mono">
          Sin datos
        </div>
      )}
    </div>
  );
}