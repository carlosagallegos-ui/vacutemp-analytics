import { useState, useRef, useCallback } from 'react';

// Realistic simulation state for a vacuum deposition system
const createSimState = () => ({
  T1: 650,   // Celda 1 temp (°C)
  T2: 580,   // Celda 2 temp (°C)
  T3: 280,   // Portasustrato temp (°C)
  I1: 4.2,   // Corriente Celda 1 (A)
  I2: 3.8,   // Corriente Celda 2 (A)
  I3: 2.1,   // Corriente Portasustrato (A)
  P: 5.2e-6, // Presión (Torr)
});

function addNoise(value, pct = 0.005) {
  return value * (1 + (Math.random() - 0.5) * pct * 2);
}

function drift(value, target, speed = 0.02) {
  return value + (target - value) * speed + (Math.random() - 0.5) * speed * 0.5;
}

export function useSimulation() {
  const stateRef = useRef(createSimState());
  const targetRef = useRef({
    T1: 800, T2: 720, T3: 350,
    I1: 5.0, I2: 4.5, I3: 2.5,
    P: 4e-6
  });

  const getNextReading = useCallback(() => {
    const s = stateRef.current;
    const t = targetRef.current;

    // Occasionally shift targets to simulate process changes
    if (Math.random() < 0.02) {
      targetRef.current = {
        T1: 600 + Math.random() * 900,
        T2: 500 + Math.random() * 800,
        T3: 200 + Math.random() * 400,
        I1: 2 + Math.random() * 10,
        I2: 2 + Math.random() * 10,
        I3: 1 + Math.random() * 6,
        P: Math.pow(10, -7 + Math.random() * 4),
      };
    }

    stateRef.current = {
      T1: addNoise(drift(s.T1, t.T1, 0.015), 0.003),
      T2: addNoise(drift(s.T2, t.T2, 0.015), 0.003),
      T3: addNoise(drift(s.T3, t.T3, 0.01), 0.003),
      I1: addNoise(drift(s.I1, t.I1, 0.02), 0.005),
      I2: addNoise(drift(s.I2, t.I2, 0.02), 0.005),
      I3: addNoise(drift(s.I3, t.I3, 0.02), 0.005),
      P: Math.max(1e-9, addNoise(drift(s.P, t.P, 0.01), 0.02)),
    };

    return {
      timestamp: Date.now(),
      ...stateRef.current,
    };
  }, []);

  return { getNextReading };
}