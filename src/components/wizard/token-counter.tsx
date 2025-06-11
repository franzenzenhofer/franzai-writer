"use client";

import React from 'react';

interface TokenCounterProps {
  text: string;
}

// Simple estimation: 1 token ~ 4 chars in English
const estimateTokens = (text: string): number => {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
};

export function TokenCounter({ text }: TokenCounterProps) {
  const tokenCount = estimateTokens(text);
  
  if (tokenCount === 0) {
    return <div className="text-xs text-muted-foreground mt-1">&nbsp;</div>;
  }

  return (
    <div className="text-xs text-muted-foreground mt-1">
      ~{tokenCount} tokens
    </div>
  );
}
