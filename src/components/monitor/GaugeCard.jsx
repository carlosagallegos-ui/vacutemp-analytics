import React from 'react';
import { VARIABLES, formatValue } from '@/lib/exportUtils';

export default function GaugeCard({ varKey, value, isRecording }) {
  const meta = VARIABLES[varKey];
  const isTemp = varKey.startsWith('T');
  const isCurrent = varKey.startsWith('I');
  const isPressure = varKey === 'P';

  // Calculate fill percentage for visual bar
  let pct = 0;
  if (isTemp) pct = Math.min(100, (value / 1600) * 100);
  if (isCurrent) pct = Math.min(100, (value / 15) * 100);
  if (isPressure) {
    // Log scale: 1e-9 to 1e-1 Torr → 0 to 100%
    const logVal = Math.log10(Math.max(1e-9, value));
    pct = Math.min(100, Math.max(0, ((logVal + 9) / 8) * 100));
  }

  return (
    <div
      className="rounded-lg border border-border bg-card p-4 flex flex-col gap-2 transition-all duration-300"
      style={{ borderColor: `${meta.color}30` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
          {varKey}
        </span>
        <div
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: meta.color,
            boxShadow: isRecording ? `0 0 8px ${meta.color}` : 'none',
          }}
        />
      </div>

      {/* Label */}
      <div className="text-xs text-muted-foreground truncate">{meta.label}</div>

      {/* Value */}
      <div className="flex items-baseline gap-1">
        <span
          className="text-2xl font-mono font-semibold tabular-nums"
          style={{ color: meta.color }}
        >
          {value !== null ? formatValue(varKey, value) : '—'}
        </span>
        <span className="text-xs text-muted-foreground font-mono">{meta.unit}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: meta.color,
            boxShadow: `0 0 6px ${meta.color}80`,
          }}
        />
      </div>

      {/* Range label */}
      <div className="flex justify-between text-xs text-muted-foreground font-mono">
        <span>{isTemp ? '0°C' : isCurrent ? '0A' : '10⁻⁹'}</span>
        <span>{isTemp ? '1600°C' : isCurrent ? '15A' : '10⁻¹'}</span>
      </div>
    </div>
  );
}