'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface SharedTooltipProps {
  children: React.ReactNode;
  tooltip: string;
}

// Portal-based tooltip component to avoid clipping
export const SharedTooltip = ({ children, tooltip }: SharedTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });

    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout for 3 seconds
    const newTimeoutId = setTimeout(() => {
      setIsVisible(true);
      setTimeoutId(null);
    }, 3000);

    setTimeoutId(newTimeoutId);
  };

  const handleMouseLeave = () => {
    // Clear timeout if user leaves before 3 seconds
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const tooltipContent =
    isVisible && mounted
      ? createPortal(
          <div
            className="fixed px-4 py-3 bg-white text-gray-800 text-sm rounded-lg shadow-xl border border-gray-200 max-w-sm pointer-events-none"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              transform: 'translate(-50%, -100%)',
              zIndex: 2147483647,
            }}
          >
            <div className="space-y-2">
              {tooltip.split('||').map((section, sectionIndex) => (
                <div key={sectionIndex} className="space-y-1">
                  {section.split('|').map((line, lineIndex) => {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) return null;

                    return (
                      <div
                        key={lineIndex}
                        className={
                          lineIndex === 0
                            ? 'font-bold text-gray-900 text-base'
                            : 'text-gray-700'
                        }
                      >
                        {trimmedLine.startsWith('• ') ? (
                          <div className="flex items-start gap-2 ml-2">
                            <span className="text-blue-500 mt-1 font-bold">
                              •
                            </span>
                            <span className="flex-1">
                              {trimmedLine.substring(2)}
                            </span>
                          </div>
                        ) : (
                          <div>{trimmedLine}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
          </div>,
          document.body
        )
      : null;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="cursor-help"
    >
      {children}
      {tooltipContent}
    </div>
  );
};
