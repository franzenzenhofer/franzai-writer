"use client";

import { useState, useEffect, useCallback } from 'react';

// Rate limiting configuration
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  warningThreshold: number; // Percentage at which to show warning (e.g., 0.8 for 80%)
  storageKey: string;
}

// Default configuration: 10 requests per 10 minutes
const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 10 * 60 * 1000, // 10 minutes
  warningThreshold: 0.8, // Show warning at 80% usage
  storageKey: 'ai-rate-limit-requests'
};

// Request record interface
interface RequestRecord {
  timestamp: number;
  endpoint?: string;
  userId?: string;
}

// Rate limit status
export interface RateLimitStatus {
  isLimited: boolean;
  remainingRequests: number;
  totalRequests: number;
  resetTime: number | null;
  shouldShowWarning: boolean;
  usagePercentage: number;
}

// Rate limit error
export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly remainingRequests: number,
    public readonly resetTime: number | null,
    public readonly retryAfter: number | null
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

// Utility functions
function getStoredRequests(storageKey: string): RequestRecord[] {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('[RateLimit] Failed to parse stored requests:', error);
    return [];
  }
}

function storeRequests(storageKey: string, requests: RequestRecord[]): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(requests));
  } catch (error) {
    console.warn('[RateLimit] Failed to store requests:', error);
  }
}

function cleanupExpiredRequests(requests: RequestRecord[], windowMs: number): RequestRecord[] {
  const now = Date.now();
  return requests.filter(req => now - req.timestamp < windowMs);
}

function calculateResetTime(requests: RequestRecord[], windowMs: number): number | null {
  if (requests.length === 0) return null;
  
  const oldestRequest = requests[0];
  return oldestRequest.timestamp + windowMs;
}

// Main rate limiting hook
export function useRateLimit(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const [status, setStatus] = useState<RateLimitStatus>({
    isLimited: false,
    remainingRequests: finalConfig.maxRequests,
    totalRequests: finalConfig.maxRequests,
    resetTime: null,
    shouldShowWarning: false,
    usagePercentage: 0
  });

  // Update rate limit status
  const updateStatus = useCallback(() => {
    const allRequests = getStoredRequests(finalConfig.storageKey);
    const validRequests = cleanupExpiredRequests(allRequests, finalConfig.windowMs);
    
    // Store cleaned requests
    if (validRequests.length !== allRequests.length) {
      storeRequests(finalConfig.storageKey, validRequests);
    }
    
    const usedRequests = validRequests.length;
    const remainingRequests = Math.max(0, finalConfig.maxRequests - usedRequests);
    const isLimited = usedRequests >= finalConfig.maxRequests;
    const usagePercentage = usedRequests / finalConfig.maxRequests;
    const shouldShowWarning = usagePercentage >= finalConfig.warningThreshold && !isLimited;
    const resetTime = calculateResetTime(validRequests, finalConfig.windowMs);
    
    setStatus({
      isLimited,
      remainingRequests,
      totalRequests: finalConfig.maxRequests,
      resetTime,
      shouldShowWarning,
      usagePercentage
    });
  }, [finalConfig]);

  // Check if request can be made
  const canMakeRequest = useCallback((): boolean => {
    const allRequests = getStoredRequests(finalConfig.storageKey);
    const validRequests = cleanupExpiredRequests(allRequests, finalConfig.windowMs);
    return validRequests.length < finalConfig.maxRequests;
  }, [finalConfig]);

  // Record a request
  const recordRequest = useCallback((endpoint?: string, userId?: string): void => {
    const allRequests = getStoredRequests(finalConfig.storageKey);
    const validRequests = cleanupExpiredRequests(allRequests, finalConfig.windowMs);
    
    const newRequest: RequestRecord = {
      timestamp: Date.now(),
      endpoint,
      userId
    };
    
    validRequests.push(newRequest);
    storeRequests(finalConfig.storageKey, validRequests);
    updateStatus();
  }, [finalConfig, updateStatus]);

  // Check and record request atomically
  const checkAndRecord = useCallback((endpoint?: string, userId?: string): void => {
    if (!canMakeRequest()) {
      const resetTime = calculateResetTime(
        getStoredRequests(finalConfig.storageKey),
        finalConfig.windowMs
      );
      const retryAfter = resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : null;
      
      throw new RateLimitError(
        `Rate limit exceeded. You can make ${finalConfig.maxRequests} AI requests per ${Math.round(finalConfig.windowMs / 60000)} minutes. Please try again in ${retryAfter ? `${retryAfter} seconds` : 'a few minutes'}.`,
        status.remainingRequests,
        resetTime,
        retryAfter
      );
    }
    
    recordRequest(endpoint, userId);
  }, [canMakeRequest, recordRequest, finalConfig, status.remainingRequests]);

  // Reset all requests (useful for testing or admin purposes)
  const resetRequests = useCallback(() => {
    localStorage.removeItem(finalConfig.storageKey);
    updateStatus();
  }, [finalConfig.storageKey, updateStatus]);

  // Get time until reset
  const getTimeUntilReset = useCallback((): number | null => {
    if (!status.resetTime) return null;
    return Math.max(0, status.resetTime - Date.now());
  }, [status.resetTime]);

  // Format time until reset
  const formatTimeUntilReset = useCallback((): string | null => {
    const timeUntilReset = getTimeUntilReset();
    if (!timeUntilReset) return null;
    
    const minutes = Math.floor(timeUntilReset / 60000);
    const seconds = Math.floor((timeUntilReset % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }, [getTimeUntilReset]);

  // Update status on mount and when config changes
  useEffect(() => {
    updateStatus();
    
    // Set up interval to update status every 5 seconds
    const interval = setInterval(updateStatus, 5000);
    
    return () => clearInterval(interval);
  }, [updateStatus]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === finalConfig.storageKey) {
        updateStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [finalConfig.storageKey, updateStatus]);

  return {
    status,
    canMakeRequest,
    recordRequest,
    checkAndRecord,
    resetRequests,
    getTimeUntilReset,
    formatTimeUntilReset,
    config: finalConfig
  };
}

// Standalone rate limiting service (can be used outside React components)
export class RateLimitService {
  private config: RateLimitConfig;
  
  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  canMakeRequest(): boolean {
    const allRequests = getStoredRequests(this.config.storageKey);
    const validRequests = cleanupExpiredRequests(allRequests, this.config.windowMs);
    return validRequests.length < this.config.maxRequests;
  }
  
  recordRequest(endpoint?: string, userId?: string): void {
    const allRequests = getStoredRequests(this.config.storageKey);
    const validRequests = cleanupExpiredRequests(allRequests, this.config.windowMs);
    
    const newRequest: RequestRecord = {
      timestamp: Date.now(),
      endpoint,
      userId
    };
    
    validRequests.push(newRequest);
    storeRequests(this.config.storageKey, validRequests);
  }
  
  checkAndRecord(endpoint?: string, userId?: string): void {
    if (!this.canMakeRequest()) {
      const allRequests = getStoredRequests(this.config.storageKey);
      const validRequests = cleanupExpiredRequests(allRequests, this.config.windowMs);
      const resetTime = calculateResetTime(validRequests, this.config.windowMs);
      const retryAfter = resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : null;
      
      throw new RateLimitError(
        `Rate limit exceeded. You can make ${this.config.maxRequests} AI requests per ${Math.round(this.config.windowMs / 60000)} minutes. Please try again in ${retryAfter ? `${retryAfter} seconds` : 'a few minutes'}.`,
        Math.max(0, this.config.maxRequests - validRequests.length),
        resetTime,
        retryAfter
      );
    }
    
    this.recordRequest(endpoint, userId);
  }
  
  getStatus(): RateLimitStatus {
    const allRequests = getStoredRequests(this.config.storageKey);
    const validRequests = cleanupExpiredRequests(allRequests, this.config.windowMs);
    
    const usedRequests = validRequests.length;
    const remainingRequests = Math.max(0, this.config.maxRequests - usedRequests);
    const isLimited = usedRequests >= this.config.maxRequests;
    const usagePercentage = usedRequests / this.config.maxRequests;
    const shouldShowWarning = usagePercentage >= this.config.warningThreshold && !isLimited;
    const resetTime = calculateResetTime(validRequests, this.config.windowMs);
    
    return {
      isLimited,
      remainingRequests,
      totalRequests: this.config.maxRequests,
      resetTime,
      shouldShowWarning,
      usagePercentage
    };
  }
}

// Default rate limit service instance
export const defaultRateLimitService = new RateLimitService();