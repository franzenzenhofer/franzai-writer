"use client";

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Info, RefreshCw } from 'lucide-react';
import { useRateLimit, type RateLimitStatus } from '@/hooks/use-rate-limit';
import { cn } from '@/lib/utils';

interface RateLimitStatusProps {
  status: RateLimitStatus;
  formatTimeUntilReset: () => string | null;
  className?: string;
  showProgress?: boolean;
  showResetButton?: boolean;
  onReset?: () => void;
}

export function RateLimitStatusDisplay({ 
  status, 
  formatTimeUntilReset, 
  className,
  showProgress = true,
  showResetButton = false,
  onReset
}: RateLimitStatusProps) {
  const timeUntilReset = formatTimeUntilReset();
  
  // Don't show anything if usage is low and no limits are active
  if (!status.isLimited && !status.shouldShowWarning && status.usagePercentage < 0.5) {
    return null;
  }
  
  return (
    <div className={cn("space-y-2", className)}>
      {/* Rate limit warning */}
      {status.shouldShowWarning && (
        <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-900/30">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-700 dark:text-amber-300">
            AI Usage Warning
          </AlertTitle>
          <AlertDescription className="text-amber-600 dark:text-amber-400">
            You have {status.remainingRequests} AI requests remaining out of {status.totalRequests}.
            {timeUntilReset && (
              <span className="block mt-1">
                Quota resets in {timeUntilReset}.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Rate limit exceeded */}
      {status.isLimited && (
        <Alert variant="destructive">
          <Clock className="h-4 w-4" />
          <AlertTitle>AI Rate Limit Exceeded</AlertTitle>
          <AlertDescription>
            You have reached the maximum of {status.totalRequests} AI requests per hour.
            {timeUntilReset && (
              <span className="block mt-1">
                <strong>Try again in {timeUntilReset}.</strong>
              </span>
            )}
            <div className="mt-2 text-sm">
              This limit helps prevent abuse and ensures fair usage for all users.
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Progress bar */}
      {showProgress && (status.shouldShowWarning || status.isLimited) && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>AI Usage</span>
            <span>{status.totalRequests - status.remainingRequests} / {status.totalRequests}</span>
          </div>
          <Progress 
            value={status.usagePercentage * 100} 
            className={cn(
              "h-2",
              status.isLimited && "bg-red-100 [&>div]:bg-red-500",
              status.shouldShowWarning && !status.isLimited && "bg-amber-100 [&>div]:bg-amber-500"
            )}
          />
          {timeUntilReset && (
            <div className="text-xs text-muted-foreground">
              Resets in {timeUntilReset}
            </div>
          )}
        </div>
      )}
      
      {/* Reset button for development/testing */}
      {showResetButton && onReset && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="w-full"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Reset Rate Limit (Dev)
        </Button>
      )}
    </div>
  );
}

interface RateLimitBadgeProps {
  status: RateLimitStatus;
  className?: string;
}

export function RateLimitBadge({ status, className }: RateLimitBadgeProps) {
  if (!status.isLimited && !status.shouldShowWarning) {
    return null;
  }
  
  return (
    <Badge 
      variant={status.isLimited ? "destructive" : "secondary"}
      className={cn("text-xs", className)}
    >
      {status.isLimited ? (
        <>
          <Clock className="w-3 h-3 mr-1" />
          Rate Limited
        </>
      ) : (
        <>
          <AlertTriangle className="w-3 h-3 mr-1" />
          {status.remainingRequests} left
        </>
      )}
    </Badge>
  );
}

interface RateLimitProviderProps {
  children: React.ReactNode;
  showGlobalStatus?: boolean;
  className?: string;
}

export function RateLimitProvider({ 
  children, 
  showGlobalStatus = false,
  className 
}: RateLimitProviderProps) {
  const { status, formatTimeUntilReset, resetRequests } = useRateLimit();
  
  return (
    <div className={className}>
      {showGlobalStatus && (
        <div className="mb-4">
          <RateLimitStatusDisplay 
            status={status}
            formatTimeUntilReset={formatTimeUntilReset}
            showResetButton={process.env.NODE_ENV === 'development'}
            onReset={resetRequests}
          />
        </div>
      )}
      {children}
    </div>
  );
}

// Hook to get rate limit status for any component
export function useRateLimitStatus() {
  return useRateLimit();
}