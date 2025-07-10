'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, RefreshCw, Home, Bug, Copy, CheckCircle } from 'lucide-react';
import { categorizeError, getErrorCategoryInfo, CategorizedError } from '@/lib/error-categories';
import { errorTelemetry } from '@/lib/error-telemetry';
import { errorLogger } from '@/lib/error-logger';
import { useToast } from '@/hooks/use-toast';

interface EnhancedErrorBoundaryState {
  hasError: boolean;
  categorizedError: CategorizedError | null;
  retryCount: number;
  lastErrorTime: number;
  isRecovering: boolean;
}

interface EnhancedErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    categorizedError: CategorizedError | null;
    reset: () => void;
    retry: () => void;
    retryCount: number;
    maxRetries: number;
    isRecovering?: boolean;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
  autoRetryDelay?: number;
  component?: string;
  userId?: string;
  workflowId?: string;
  stageId?: string;
}

class EnhancedErrorBoundary extends React.Component<EnhancedErrorBoundaryProps, EnhancedErrorBoundaryState> {
  private autoRetryTimer: NodeJS.Timeout | null = null;

  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      categorizedError: null,
      retryCount: 0,
      lastErrorTime: 0,
      isRecovering: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<EnhancedErrorBoundaryState> {
    const now = Date.now();
    return {
      hasError: true,
      lastErrorTime: now,
      isRecovering: false,
    };
  }

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { component, userId, workflowId, stageId } = this.props;
    
    // Categorize the error
    const categorizedError = categorizeError(error, {
      component,
      userId,
      workflowId,
      stageId,
      additionalData: {
        errorInfo,
        retryCount: this.state.retryCount,
        lastErrorTime: this.state.lastErrorTime,
      },
    });

    // Update state with categorized error
    this.setState({ categorizedError });

    // Log to console for development
    console.error('Enhanced Error Boundary caught error:', {
      error,
      errorInfo,
      categorizedError,
      component,
      userId,
      workflowId,
      stageId,
    });

    // Log to error logger (legacy)
    errorLogger.logError(error, {
      component: errorInfo.componentStack || component || '',
      userId,
      metadata: {
        errorInfo,
        workflowId,
        stageId,
        retryCount: this.state.retryCount,
        errorCategory: categorizedError.metadata.category,
        errorSeverity: categorizedError.metadata.severity,
      },
    });

    // Log to enhanced telemetry
    try {
      await errorTelemetry.logError(categorizedError);
    } catch (telemetryError) {
      console.error('Failed to log to error telemetry:', telemetryError);
    }

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Auto-retry for retryable errors
    if (categorizedError.metadata.retryable && this.shouldAutoRetry()) {
      this.scheduleAutoRetry();
    }
  }

  private shouldAutoRetry(): boolean {
    const maxRetries = this.props.maxRetries || 3;
    const timeSinceLastError = Date.now() - this.state.lastErrorTime;
    const minRetryInterval = 1000; // 1 second

    return (
      this.state.retryCount < maxRetries &&
      timeSinceLastError > minRetryInterval
    );
  }

  private scheduleAutoRetry(): void {
    const delay = this.props.autoRetryDelay || 2000; // 2 seconds default
    const retryDelay = Math.min(delay * Math.pow(2, this.state.retryCount), 10000); // Exponential backoff, max 10s

    this.setState({ isRecovering: true });

    this.autoRetryTimer = setTimeout(() => {
      this.retry();
    }, retryDelay);
  }

  private clearAutoRetryTimer(): void {
    if (this.autoRetryTimer) {
      clearTimeout(this.autoRetryTimer);
      this.autoRetryTimer = null;
    }
  }

  componentWillUnmount(): void {
    this.clearAutoRetryTimer();
  }

  reset = (): void => {
    this.clearAutoRetryTimer();
    this.setState({
      hasError: false,
      categorizedError: null,
      retryCount: 0,
      lastErrorTime: 0,
      isRecovering: false,
    });
  };

  retry = (): void => {
    this.clearAutoRetryTimer();
    this.setState(prevState => ({
      hasError: false,
      categorizedError: null,
      retryCount: prevState.retryCount + 1,
      lastErrorTime: 0,
      isRecovering: false,
    }));
  };

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultEnhancedErrorFallback;
      return (
        <Fallback
          categorizedError={this.state.categorizedError}
          reset={this.reset}
          retry={this.retry}
          retryCount={this.state.retryCount}
          maxRetries={this.props.maxRetries || 3}
          isRecovering={this.state.isRecovering}
        />
      );
    }

    return this.props.children;
  }
}

interface DefaultEnhancedErrorFallbackProps {
  categorizedError: CategorizedError | null;
  reset: () => void;
  retry: () => void;
  retryCount: number;
  maxRetries: number;
  isRecovering?: boolean;
}

function DefaultEnhancedErrorFallback({
  categorizedError,
  reset,
  retry,
  retryCount,
  maxRetries,
  isRecovering = false,
}: DefaultEnhancedErrorFallbackProps) {
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const error = categorizedError?.originalError;
  const metadata = categorizedError?.metadata;

  if (!error || !metadata) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            An unexpected error occurred. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const categoryInfo = getErrorCategoryInfo(metadata.category);
  const canRetry = metadata.retryable && retryCount < maxRetries;

  const handleCopyError = async () => {
    const errorDetails = {
      errorId: metadata.errorId,
      message: error.message,
      category: metadata.category,
      severity: metadata.severity,
      timestamp: metadata.timestamp,
      component: metadata.component,
      url: metadata.url,
      stack: metadata.stack,
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      setCopied(true);
      toast({
        title: "Error details copied",
        description: "Error information has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-full ${categoryInfo.bgColor}`}>
              <span className="text-lg">{categoryInfo.icon}</span>
            </div>
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {categoryInfo.title}
                <Badge variant={metadata.severity === 'critical' ? 'destructive' : 'secondary'}>
                  {metadata.severity}
                </Badge>
              </CardTitle>
              <CardDescription>
                Error ID: {metadata.errorId}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>What happened?</AlertTitle>
            <AlertDescription>
              {metadata.userMessage}
            </AlertDescription>
          </Alert>

          {metadata.actionSuggestion && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>What can you do?</AlertTitle>
              <AlertDescription>
                {metadata.actionSuggestion}
              </AlertDescription>
            </Alert>
          )}

          {isRecovering && (
            <Alert>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <AlertTitle>Recovering...</AlertTitle>
              <AlertDescription>
                Attempting to recover from the error automatically.
              </AlertDescription>
            </Alert>
          )}

          {retryCount > 0 && (
            <Alert>
              <RefreshCw className="h-4 w-4" />
              <AlertTitle>Retry Attempt</AlertTitle>
              <AlertDescription>
                This is retry attempt {retryCount} of {maxRetries}.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-2">
            {canRetry && !isRecovering && (
              <Button onClick={retry} variant="default" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
            
            <Button onClick={reset} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
            
            <Button onClick={handleGoHome} variant="outline" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
            
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <Bug className="h-4 w-4" />
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          </div>

          {showDetails && (
            <div className="space-y-3">
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Error Details</h4>
                <div className="bg-gray-50 p-3 rounded-md text-sm font-mono">
                  <div><strong>Message:</strong> {error.message}</div>
                  <div><strong>Category:</strong> {metadata.category}</div>
                  <div><strong>Severity:</strong> {metadata.severity}</div>
                  <div><strong>Time:</strong> {new Date(metadata.timestamp).toLocaleString()}</div>
                  {metadata.component && <div><strong>Component:</strong> {metadata.component}</div>}
                  {metadata.workflowId && <div><strong>Workflow:</strong> {metadata.workflowId}</div>}
                  {metadata.stageId && <div><strong>Stage:</strong> {metadata.stageId}</div>}
                  {metadata.url && <div><strong>URL:</strong> {metadata.url}</div>}
                </div>
              </div>

              {metadata.stack && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Stack Trace</h4>
                  <div className="bg-gray-50 p-3 rounded-md text-xs font-mono overflow-x-auto max-h-40">
                    <pre>{metadata.stack}</pre>
                  </div>
                </div>
              )}

              <Button
                onClick={handleCopyError}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Error Details
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default EnhancedErrorBoundary;