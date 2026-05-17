import React, { useState, useRef } from 'react';
import { Usb, WifiOff } from 'lucide-react';

// Web Serial API interface for Arduino
export function useArduino() {
  const portRef = useRef(null);
  const readerRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const bufferRef = useRef('');
  const onDataRef = useRef(null);

  const connect = async () => {
    if (!navigator.serial) {
      setError('Web Serial API no disponible. Usa Chrome/Edge y habilita el flag.');
      return;
    }
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      portRef.current = port;
      setConnected(true);
      setError(null);

      // Read loop
      const reader = port.readable.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();

      const readLoop = async () => {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          bufferRef.current += decoder.decode(value);
          const lines = bufferRef.current.split('\n');
          bufferRef.current = lines.pop();
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && onDataRef.current) {
              onDataRef.current(trimmed);
            }
          }
        }
      };
      readLoop().catch(() => { setConnected(false); });
    } catch (e) {
      setError(e.message);
    }
  };

  const disconnect = async () => {
    readerRef.current?.cancel();
    await portRef.current?.close();
    portRef.current = null;
    setConnected(false);
  };

  const parseArduinoLine = (line) => {
    // Expected format: T1,T2,T3,I1,I2,I3,P
    const parts = line.split(',').map(Number);
    if (parts.length < 7 || parts.some(isNaN)) return null;
    return {
      timestamp: Date.now(),
      T1: parts[0], T2: parts[1], T3: parts[2],
      I1: parts[3], I2: parts[4], I3: parts[5],
      P: parts[6],
    };
  };

  return { connect, disconnect, connected, error, onDataRef, parseArduinoLine };
}

export default function ArduinoStatus({ connected, error, onConnect, onDisconnect }) {
  return (
    <div className="flex items-center gap-2">
      {connected ? (
        <button
          onClick={onDisconnect}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono text-destructive hover:bg-muted transition-colors"
        >
          <WifiOff className="w-3 h-3" /> Desconectar
        </button>
      ) : (
        <button
          onClick={onConnect}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono hover:bg-muted transition-colors"
          style={{ color: '#00E676' }}
        >
          <Usb className="w-3 h-3" /> Conectar Puerto
        </button>
      )}
      {error && <span className="text-xs font-mono text-destructive">{error}</span>}
    </div>
  );
}