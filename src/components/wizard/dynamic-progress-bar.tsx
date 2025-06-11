"use client";

import React, { useState, useEffect } from 'react';

interface DynamicProgressBarProps {
  isRunning: boolean;
  className?: string;
}

export function DynamicProgressBar({ isRunning, className = "" }: DynamicProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!isRunning) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        // Don't go past 95% until actually complete
        if (prev >= 95) return prev;
        
        // Vary speed for realistic feel
        const newSpeed = 0.5 + Math.random() * 2; // 0.5x to 2.5x speed
        setSpeed(newSpeed);
        
        // Slower progress as we get further along
        const progressMultiplier = prev < 50 ? 1 : 0.6;
        const increment = newSpeed * progressMultiplier * (0.8 + Math.random() * 0.4);
        
        return Math.min(prev + increment, 95);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Complete the progress when stopping
  useEffect(() => {
    if (!isRunning && progress > 0) {
      setProgress(100);
      setTimeout(() => setProgress(0), 300);
    }
  }, [isRunning, progress]);

  if (!isRunning && progress === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <span className="text-sm text-muted-foreground">AI is processing your request...</span>
      </div>
      <div className="space-y-2">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-200 ease-out"
            style={{ 
              width: `${progress}%`,
              transition: `width ${200 / speed}ms ease-out`
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {progress < 30 ? "Analyzing your request..." : 
           progress < 60 ? "Generating content..." :
           progress < 90 ? "Finalizing response..." :
           "Almost done..."}
        </p>
      </div>
    </div>
  );
} 