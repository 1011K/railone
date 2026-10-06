import React from 'react';

interface VisualQRCodeProps {
  payload: string;
  size?: number;
}

/**
 * Deterministic SVG QR Matrix Renderer for Specimen Railway Tickets
 * Generates official finder patterns and pseudo-random deterministic data cells.
 */
export const VisualQRCode: React.FC<VisualQRCodeProps> = ({ payload, size = 96 }) => {
  // Hash the payload into a deterministic 21x21 grid
  const gridSize = 21;
  const hash = Array.from(payload).reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);

  const isModuleDark = (row: number, col: number): boolean => {
    // Top-left finder pattern
    if (row < 7 && col < 7) {
      if (row === 0 || row === 6 || col === 0 || col === 6) return true;
      if (row >= 2 && row <= 4 && col >= 2 && col <= 4) return true;
      return false;
    }
    // Top-right finder pattern
    if (row < 7 && col >= gridSize - 7) {
      const c = col - (gridSize - 7);
      if (row === 0 || row === 6 || c === 0 || c === 6) return true;
      if (row >= 2 && row <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    // Bottom-left finder pattern
    if (row >= gridSize - 7 && col < 7) {
      const r = row - (gridSize - 7);
      if (r === 0 || r === 6 || col === 0 || col === 6) return true;
      if (r >= 2 && r <= 4 && col >= 2 && col <= 4) return true;
      return false;
    }

    // Timing patterns
    if (row === 6 && col % 2 === 0) return true;
    if (col === 6 && row % 2 === 0) return true;

    // Deterministic payload-derived module bit
    const bitIndex = (row * gridSize + col + hash) % 31;
    return ((hash >> (bitIndex % 16)) & 1) === 1 || ((row + col * 3 + hash) % 3 === 0);
  };

  const moduleSize = size / gridSize;

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox={`0 0 ${size} ${size}`} 
      className="bg-white p-1 rounded-lg border border-slate-300 dark:border-slate-600 shadow-xs shrink-0"
      aria-label="Specimen QR Code"
    >
      <rect width={size} height={size} fill="white" />
      {Array.from({ length: gridSize }).map((_, row) =>
        Array.from({ length: gridSize }).map((_, col) => {
          if (!isModuleDark(row, col)) return null;
          return (
            <rect
              key={`${row}-${col}`}
              x={col * moduleSize}
              y={row * moduleSize}
              width={moduleSize}
              height={moduleSize}
              fill="#0f172a"
            />
          );
        })
      )}
    </svg>
  );
};
