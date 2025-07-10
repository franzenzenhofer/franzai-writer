"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useRateLimitStatus } from '@/components/ui/rate-limit-status';
import { RateLimitStatusDisplay } from '@/components/ui/rate-limit-status';
import { defaultRateLimitService, RateLimitError } from '@/hooks/use-rate-limit';

interface TestResult {
  success: boolean;
  message: string;
  timestamp: Date;
}

export function RateLimitTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { status, formatTimeUntilReset, resetRequests } = useRateLimitStatus();

  const addTestResult = (success: boolean, message: string) => {
    setTestResults(prev => [...prev, { success, message, timestamp: new Date() }]);
  };

  const runBasicTest = async () => {
    setIsRunning(true);
    addTestResult(true, "Starting rate limit test...");
    
    try {
      // Test 1: Check if we can make a request when not limited
      const canMake = defaultRateLimitService.canMakeRequest();
      addTestResult(canMake, `Can make request: ${canMake}`);
      
      // Test 2: Record a request
      if (canMake) {
        defaultRateLimitService.recordRequest('/test', 'test-user');
        addTestResult(true, "Request recorded successfully");
        
        // Test 3: Check status after recording
        const statusAfter = defaultRateLimitService.getStatus();
        addTestResult(true, `Status after request: ${statusAfter.remainingRequests} remaining`);
      }
      
    } catch (error) {
      addTestResult(false, `Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRunning(false);
    }
  };

  const runStressTest = async () => {
    setIsRunning(true);
    addTestResult(true, "Starting stress test (attempting to exceed rate limit)...");
    
    try {
      // Attempt to make more requests than the limit
      for (let i = 0; i < 15; i++) {
        try {
          defaultRateLimitService.checkAndRecord('/test', 'stress-test-user');
          addTestResult(true, `Request ${i + 1} succeeded`);
        } catch (error) {
          if (error instanceof RateLimitError) {
            addTestResult(false, `Request ${i + 1} rate limited: ${error.message}`);
            break;
          } else {
            addTestResult(false, `Request ${i + 1} failed: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      }
      
    } catch (error) {
      addTestResult(false, `Stress test error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const handleReset = () => {
    resetRequests();
    addTestResult(true, "Rate limit reset successful");
  };

  if (process.env.NODE_ENV !== 'development') {
    return (
      <Alert>
        <AlertDescription>
          Rate limit testing is only available in development mode.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rate Limit Testing</CardTitle>
          <CardDescription>
            Test the rate limiting functionality to ensure it works correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div>
            <h3 className="font-medium mb-2">Current Status</h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={status.isLimited ? "destructive" : "default"}>
                {status.remainingRequests} / {status.totalRequests} requests remaining
              </Badge>
              {status.shouldShowWarning && (
                <Badge variant="secondary">Warning threshold reached</Badge>
              )}
            </div>
            <RateLimitStatusDisplay 
              status={status}
              formatTimeUntilReset={formatTimeUntilReset}
              showResetButton={true}
              onReset={handleReset}
            />
          </div>

          {/* Test Controls */}
          <div className="flex gap-2">
            <Button 
              onClick={runBasicTest} 
              disabled={isRunning}
              variant="outline"
            >
              {isRunning ? "Running..." : "Basic Test"}
            </Button>
            <Button 
              onClick={runStressTest} 
              disabled={isRunning}
              variant="outline"
            >
              {isRunning ? "Running..." : "Stress Test"}
            </Button>
            <Button 
              onClick={clearResults} 
              variant="outline"
              disabled={testResults.length === 0}
            >
              Clear Results
            </Button>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Test Results</h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div 
                    key={index}
                    className={`text-sm p-2 rounded ${
                      result.success 
                        ? 'bg-green-50 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span>{result.message}</span>
                      <span className="text-xs opacity-60">
                        {result.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}