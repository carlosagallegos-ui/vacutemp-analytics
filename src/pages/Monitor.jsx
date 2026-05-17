import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Activity, FlaskConical, Thermometer, Zap, Gauge } from 'lucide-react';
import GaugeCard from '@/components/monitor/GaugeCard';
import DataTable from '@/components/monitor/DataTable';
import XYChart from '@/components/monitor/XYChart';
import TimeSeriesChart from '@/components/monitor/TimeSeriesChart';
import ControlPanel from '@/components/monitor/ControlPanel';
import ArduinoStatus, { useArduino } from '@/components/monitor/ArduinoConnector';
import { useSimulation } from '@/lib/useSimulation';
import { VARIABLES } from '@/lib/exportUtils';

const KEYS = ['T1', 'T2', 'T3', 'I1', 'I2', 'I3', 'P'];

export default function Monitor() {
  const [isRecording, setIsRecording] = useState(false);
  const [dataPoints, setDataPoints] = useState([]);
  const [currentReading, setCurrentReading] = useState(null);
  const [sessionName, setSessionName] = useState('experimento_01');
  const [sampleInterval, setSampleInterval] = useState(1000);
  const [connectionMode, setConnectionMode] = useState('simulation');
  const [activeTab, setActiveTab] = useState('dashboard');

  const intervalRef = useRef(null);
  const { getNextReading } = useSimulation();
  const arduino = useArduino();

  // Arduino data callback
  useEffect(() => {
    arduino.onDataRef.current = (line) => {
      const reading = arduino.parseArduinoLine(line);
      if (reading && isRecording) {
        setCurrentReading(reading);
        setDataPoints(prev => [...prev, reading]);
      }
    };
  }, [isRecording]);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    if (connectionMode === 'simulation') {
      intervalRef.current = setInterval(() => {
        const reading = getNextReading();
        setCurrentReading(reading);
        setDataPoints(prev => [...prev, reading]);
      }, sampleInterval);
    }
    // Arduino mode: data comes via serial callback
  }, [connectionMode, sampleInterval, getNextReading]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    clearInterval(intervalRef.current);
  }, []);

  const clearData = useCallback(() => {
    setDataPoints([]);
    setCurrentReading(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => clearInterval(intervalRef.current), []);

  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: Activity },
    { key: 'timeseries', label: 'Series de Tiempo', icon: Gauge },
    { key: 'xy', label: 'Gráfica X-Y', icon: Zap },
    { key: 'tabla', label: 'Tabla', icon: FlaskConical },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <FlaskConical className="w-5 h-5 text-primary" />
            <span className="font-mono font-semibold text-foreground tracking-wider">VacuumLab</span>
            <span className="font-mono text-xs text-muted-foreground">Monitor</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 ml-2 text-xs font-mono text-muted-foreground">
            <span className="px-1.5 py-0.5 rounded bg-muted">Sistema de Deposición por Efusión</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {connectionMode === 'arduino' && (
            <ArduinoStatus
              connected={arduino.connected}
              error={arduino.error}
              onConnect={arduino.connect}
              onDisconnect={arduino.disconnect}
            />
          )}

          {/* Live indicator */}
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: isRecording ? '#00E676' : '#444',
                boxShadow: isRecording ? '0 0 10px #00E676' : 'none',
              }}
            />
            <span className="text-xs font-mono text-muted-foreground hidden sm:block">
              {isRecording ? 'LIVE' : 'IDLE'}
            </span>
          </div>

          {/* Point count */}
          <span className="text-xs font-mono text-muted-foreground hidden md:block">
            {dataPoints.length.toLocaleString()} pts
          </span>
        </div>
      </header>

      {/* Current readings strip */}
      {currentReading && (
        <div className="border-b border-border bg-muted/30 px-6 py-2 flex flex-wrap gap-4">
          {KEYS.map(k => (
            <div key={k} className="flex items-baseline gap-1">
              <span className="text-xs font-mono text-muted-foreground">{k}:</span>
              <span className="text-sm font-mono font-semibold tabular-nums" style={{ color: VARIABLES[k].color }}>
                {k === 'P' ? currentReading[k].toExponential(2) :
                 k.startsWith('T') ? currentReading[k].toFixed(1) :
                 currentReading[k].toFixed(3)}
              </span>
              <span className="text-xs font-mono text-muted-foreground">{VARIABLES[k].unit}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {/* Tab navigation */}
          <div className="flex gap-1 mb-6 border-b border-border pb-1">
            {tabs.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-t transition-all"
                  style={{
                    borderBottom: activeTab === t.key ? `2px solid hsl(var(--primary))` : '2px solid transparent',
                    color: activeTab === t.key ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                    backgroundColor: activeTab === t.key ? 'hsl(var(--muted))' : 'transparent',
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:block">{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-6">
              {/* Gauge grid */}
              <div>
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Thermometer className="w-3 h-3" /> Lecturas en Tiempo Real
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                  {KEYS.map(k => (
                    <GaugeCard
                      key={k}
                      varKey={k}
                      value={currentReading ? currentReading[k] : null}
                      isRecording={isRecording}
                    />
                  ))}
                </div>
              </div>

              {/* Quick chart */}
              {dataPoints.length > 1 && <TimeSeriesChart dataPoints={dataPoints} />}

              {dataPoints.length === 0 && !isRecording && (
                <div className="rounded-lg border border-border bg-card p-12 text-center flex flex-col items-center gap-3">
                  <FlaskConical className="w-10 h-10 text-muted-foreground" />
                  <div className="text-sm font-mono text-muted-foreground">
                    Configura los parámetros y presiona <span className="text-accent">Iniciar Adquisición</span>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground/60">
                    Sistema de efusión en vacío · 2 celdas · portasustrato · bomba turbomolecular
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeseries' && <TimeSeriesChart dataPoints={dataPoints} />}
          {activeTab === 'xy' && <XYChart dataPoints={dataPoints} />}
          {activeTab === 'tabla' && <DataTable dataPoints={dataPoints} />}
        </main>

        {/* Sidebar Control Panel */}
        <aside className="w-64 border-l border-border bg-card p-4 flex-shrink-0 overflow-auto hidden md:block">
          <ControlPanel
            isRecording={isRecording}
            onStart={startRecording}
            onStop={stopRecording}
            onClear={clearData}
            dataPoints={dataPoints}
            sessionName={sessionName}
            onSessionNameChange={setSessionName}
            sampleInterval={sampleInterval}
            onSampleIntervalChange={setSampleInterval}
            connectionMode={connectionMode}
            onConnectionModeChange={setConnectionMode}
          />
        </aside>
      </div>

      {/* Mobile control bar */}
      <div className="md:hidden border-t border-border bg-card p-3 flex gap-2">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded font-mono text-sm font-semibold transition-all"
          style={{
            backgroundColor: isRecording ? 'hsl(var(--destructive))' : 'hsl(var(--accent))',
            color: isRecording ? 'hsl(var(--destructive-foreground))' : 'hsl(var(--accent-foreground))',
          }}
        >
          {isRecording ? '⏹ Detener' : '▶ Iniciar'}
        </button>
      </div>
    </div>
  );
}