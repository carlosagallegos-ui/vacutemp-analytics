import React, { useState } from 'react';
import { Play, Square, Download, Trash2, Usb } from 'lucide-react';
import { exportToTxt, exportToCSV } from '@/lib/exportUtils';

export default function ControlPanel({
  isRecording, onStart, onStop, onClear,
  dataPoints, sessionName, onSessionNameChange,
  sampleInterval, onSampleIntervalChange,
  connectionMode, onConnectionModeChange,
}) {
  const [showExport, setShowExport] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-4">
      {/* Session Name */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Sesión</label>
        <input
          value={sessionName}
          onChange={e => onSessionNameChange(e.target.value)}
          disabled={isRecording}
          placeholder="nombre_experimento"
          className="bg-muted border border-border rounded px-3 py-1.5 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
        />
      </div>

      {/* Connection Mode */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Modo</label>
        <div className="flex gap-1">
          {['simulation', 'arduino'].map(mode => (
            <button
              key={mode}
              onClick={() => !isRecording && onConnectionModeChange(mode)}
              disabled={isRecording}
              className="flex-1 px-3 py-1.5 text-xs font-mono rounded transition-all disabled:opacity-40"
              style={{
                backgroundColor: connectionMode === mode ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                color: connectionMode === mode ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
              }}
            >
              {mode === 'simulation' ? '⚡ Simulación' : '🔌 Arduino'}
            </button>
          ))}
        </div>
        {connectionMode === 'arduino' && (
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Conecta Arduino vía Web Serial API. Asegúrate de que el firmware envíe: T1,T2,T3,I1,I2,I3,P por línea serial.
          </p>
        )}
      </div>

      {/* Sample Interval */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          Intervalo: <span className="text-primary">{(sampleInterval / 1000).toFixed(1)}s</span>
        </label>
        <input
          type="range"
          min={500} max={30000} step={500}
          value={sampleInterval}
          onChange={e => onSampleIntervalChange(Number(e.target.value))}
          disabled={isRecording}
          className="w-full accent-primary disabled:opacity-40"
        />
        <div className="flex justify-between text-xs font-mono text-muted-foreground">
          <span>0.5s</span><span>30s</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col gap-2">
        {!isRecording ? (
          <button
            onClick={onStart}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded font-mono text-sm font-semibold transition-all"
            style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}
          >
            <Play className="w-4 h-4" />
            Iniciar Adquisición
          </button>
        ) : (
          <button
            onClick={onStop}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded font-mono text-sm font-semibold transition-all bg-destructive text-destructive-foreground"
          >
            <Square className="w-4 h-4" />
            <span className="recording-pulse">Detener</span>
          </button>
        )}

        {/* Export */}
        <div className="relative">
          <button
            onClick={() => setShowExport(v => !v)}
            disabled={dataPoints.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded font-mono text-sm transition-all bg-muted text-foreground hover:bg-muted/80 disabled:opacity-30"
          >
            <Download className="w-4 h-4" />
            Exportar ({dataPoints.length} pts)
          </button>
          {showExport && (
            <div className="absolute bottom-full mb-1 left-0 right-0 bg-card border border-border rounded shadow-xl z-10">
              <button
                onClick={() => { exportToCSV(dataPoints, sessionName); setShowExport(false); }}
                className="w-full px-4 py-2 text-left text-sm font-mono hover:bg-muted transition-colors"
              >
                📊 Exportar CSV (.csv)
              </button>
              <button
                onClick={() => { exportToTxt(dataPoints, sessionName); setShowExport(false); }}
                className="w-full px-4 py-2 text-left text-sm font-mono hover:bg-muted transition-colors border-t border-border"
              >
                📄 Exportar TXT (.txt)
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onClear}
          disabled={isRecording || dataPoints.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded font-mono text-xs transition-all text-muted-foreground hover:text-destructive hover:bg-muted disabled:opacity-30"
        >
          <Trash2 className="w-3 h-3" />
          Limpiar datos
        </button>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 pt-1 border-t border-border">
        <div
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: isRecording ? '#00E676' : '#666',
            boxShadow: isRecording ? '0 0 8px #00E676' : 'none',
          }}
        />
        <span className="text-xs font-mono text-muted-foreground">
          {isRecording ? 'ADQUIRIENDO' : 'EN ESPERA'}
        </span>
      </div>
    </div>
  );
}