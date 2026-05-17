export const VARIABLES = {
  T1: { label: 'T₁ Celda 1', unit: '°C', color: '#FF8C00' },
  T2: { label: 'T₂ Celda 2', unit: '°C', color: '#FFB300' },
  T3: { label: 'T₃ Portasustrato', unit: '°C', color: '#FFD700' },
  I1: { label: 'I₁ Celda 1', unit: 'A', color: '#00BFFF' },
  I2: { label: 'I₂ Celda 2', unit: 'A', color: '#4FC3F7' },
  I3: { label: 'I₃ Portasustrato', unit: 'A', color: '#81D4FA' },
  P:  { label: 'P Cámara', unit: 'Torr', color: '#00E676' },
};

export function formatValue(key, value) {
  if (value === null || value === undefined) return '—';
  if (key === 'P') return value.toExponential(2);
  if (key.startsWith('T')) return value.toFixed(1);
  if (key.startsWith('I')) return value.toFixed(3);
  return value.toString();
}

export function formatTimestamp(ts) {
  return new Date(ts).toLocaleTimeString('es-MX', { hour12: false });
}

export function exportToTxt(dataPoints, sessionName) {
  const header = ['Tiempo', 'T1(°C)', 'T2(°C)', 'T3(°C)', 'I1(A)', 'I2(A)', 'I3(A)', 'P(Torr)'].join('\t');
  const rows = dataPoints.map(d =>
    [
      formatTimestamp(d.timestamp),
      d.T1.toFixed(2), d.T2.toFixed(2), d.T3.toFixed(2),
      d.I1.toFixed(4), d.I2.toFixed(4), d.I3.toFixed(4),
      d.P.toExponential(3)
    ].join('\t')
  );
  const content = [header, ...rows].join('\n');
  downloadFile(content, `${sessionName}_${dateStamp()}.txt`, 'text/plain');
}

export function exportToCSV(dataPoints, sessionName) {
  const header = ['Tiempo', 'T1_C', 'T2_C', 'T3_C', 'I1_A', 'I2_A', 'I3_A', 'P_Torr'].join(',');
  const rows = dataPoints.map(d =>
    [
      formatTimestamp(d.timestamp),
      d.T1.toFixed(4), d.T2.toFixed(4), d.T3.toFixed(4),
      d.I1.toFixed(6), d.I2.toFixed(6), d.I3.toFixed(6),
      d.P.toExponential(6)
    ].join(',')
  );
  const content = [header, ...rows].join('\n');
  downloadFile(content, `${sessionName}_${dateStamp()}.csv`, 'text/csv');
}

function dateStamp() {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}