import React from 'react';
import { VARIABLES, formatValue, formatTimestamp } from '@/lib/exportUtils';

const KEYS = ['T1', 'T2', 'T3', 'I1', 'I2', 'I3', 'P'];

export default function DataTable({ dataPoints }) {
  const recent = dataPoints.slice(-100).reverse();

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          Registro de Datos
        </span>
        <span className="text-xs font-mono text-muted-foreground">
          {dataPoints.length} puntos
        </span>
      </div>
      <div className="overflow-auto max-h-64">
        <table className="w-full text-xs font-mono">
          <thead className="sticky top-0 bg-muted">
            <tr>
              <th className="px-3 py-2 text-left text-muted-foreground">Tiempo</th>
              {KEYS.map(k => (
                <th key={k} className="px-3 py-2 text-right" style={{ color: VARIABLES[k].color }}>
                  {k} ({VARIABLES[k].unit})
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map((row, i) => (
              <tr
                key={row.timestamp}
                className="border-t border-border/50 hover:bg-muted/30 transition-colors"
              >
                <td className="px-3 py-1.5 text-muted-foreground">
                  {formatTimestamp(row.timestamp)}
                </td>
                {KEYS.map(k => (
                  <td key={k} className="px-3 py-1.5 text-right tabular-nums" style={{ color: VARIABLES[k].color }}>
                    {formatValue(k, row[k])}
                  </td>
                ))}
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">
                  Sin datos aún. Inicia la adquisición.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}