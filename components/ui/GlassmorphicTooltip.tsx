'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TooltipPosition {
  x: number;
  y: number;
}

interface GlassmorphicTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  offset?: { x: number; y: number };
  className?: string;
}

export const GlassmorphicTooltip: React.FC<GlassmorphicTooltipProps> = ({
  content,
  children,
  delay = 300,
  offset = { x: 10, y: -10 },
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showTooltip = (event: React.MouseEvent) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setPosition({
        x: event.clientX + offset.x,
        y: event.clientY + offset.y
      });
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const updatePosition = (event: React.MouseEvent) => {
    if (isVisible) {
      setPosition({
        x: event.clientX + offset.x,
        y: event.clientY + offset.y
      });
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onMouseMove={updatePosition}
        className={className}
      >
        {children}
      </div>

      {isVisible && (
        <div
          className="fixed pointer-events-none z-50 transition-opacity duration-200"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        >
          <div className="glassmorphic-tooltip">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

// Hook for creating tooltip content for stations
export const useStationTooltip = (stationName: string, lines?: string[]) => {
  return (
    <div className="glassmorphic-tooltip-content">
      <div className="font-semibold text-sm text-white mb-1">
        {stationName}
      </div>
      {lines && lines.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {lines.map(line => (
            <span
              key={line}
              className="inline-block w-6 h-6 rounded-full text-xs font-bold text-white text-center leading-6 bg-opacity-80"
              style={{ backgroundColor: getLineColor(line) }}
            >
              {line}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper function for line colors (matching MTA colors)
const getLineColor = (line: string): string => {
  const colors: Record<string, string> = {
    '1': '#EE352E', '2': '#EE352E', '3': '#EE352E',
    '4': '#00933C', '5': '#00933C', '6': '#00933C',
    '7': '#B933AD',
    'A': '#0039A6', 'C': '#0039A6', 'E': '#0039A6',
    'B': '#FF6319', 'D': '#FF6319', 'F': '#FF6319', 'M': '#FF6319',
    'G': '#6CBE45',
    'J': '#996633', 'Z': '#996633',
    'L': '#A7A9AC',
    'N': '#FCCC0A', 'Q': '#FCCC0A', 'R': '#FCCC0A', 'W': '#FCCC0A',
    'S': '#808183',
  };
  return colors[line] || '#808183';
};

export default GlassmorphicTooltip;