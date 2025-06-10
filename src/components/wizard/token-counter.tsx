"use client";

import React, { useEffect, useState } from 'react';

interface TokenCounterProps {
  text: string;
}

// Simple estimation: 1 token ~ 4 chars in English
const estimateTokens = (text: string): number => {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
};

export function TokenCounter({ text }: TokenCounterProps) {
  const [tokenCount, setTokenCount] = useState(0);

  useEffect(() => {
    setTokenCount(estimateTokens(text));
  }, [text]);

  return (
    <div className="text-xs text-muted-foreground mt-1">
      Estimated Tokens: ~{tokenCount}
    </div>
  );
}
