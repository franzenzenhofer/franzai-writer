'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pause, Play, RefreshCw, Download, Trash2, Search, Filter, ArrowDownToLine, Zap, Copy, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  category: string;
  message: string;
  data?: any;
  model?: string;
  tokenCount?: number;
  duration?: number;
}

export default function AILogViewerPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isStreaming, setIsStreaming] = useState(true); // Start streaming by default
  const [filter, setFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all'); // all, outgoing, incoming
  const [error, setError] = useState<string | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [newLogTimestamp, setNewLogTimestamp] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isStreaming) {
      startStreaming();
    } else {
      stopStreaming();
    }
    return () => {
      stopStreaming();
    };
  }, [isStreaming]);

  useEffect(() => {
    if (autoScroll && scrollAreaRef.current) {
      // Scroll to top where newest logs appear
      scrollAreaRef.current.scrollTop = 0;
    }
  }, [logs, autoScroll]);

  const startStreaming = () => {
    try {
      const eventSource = new EventSource('/api/debug/ai-log-stream');
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const logEntry = JSON.parse(event.data) as LogEntry;
          setLogs((prev) => [...prev, logEntry]);
          setError(null);
        } catch (err) {
          console.error('Failed to parse log entry:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.error('EventSource error:', err);
        setError('Failed to connect to log stream');
        stopStreaming();
      };
    } catch (err) {
      console.error('Failed to start streaming:', err);
      setError('Failed to start log streaming');
    }
  };

  const stopStreaming = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const downloadLogs = () => {
    const logData = JSON.stringify(logs, null, 2);
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyLogEntry = (log: LogEntry, index: number) => {
    // Create a complete log object with all data
    const fullLogData = {
      timestamp: log.timestamp,
      level: log.level,
      category: log.category,
      message: log.message,
      model: log.model,
      tokenCount: log.tokenCount,
      duration: log.duration,
      data: {
        ...log.data,
        // Ensure full prompt and content are included
        fullPrompt: log.data?.fullPrompt,
        fullContent: log.data?.fullContent
      }
    };

    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(fullLogData, null, 2)).then(() => {
      setCopiedIndex(index);
      // Reset after 2 seconds
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const copyFilteredView = () => {
    // Create a complete log array with all data for filtered logs
    const fullFilteredLogs = filteredLogs.map(log => ({
      timestamp: log.timestamp,
      level: log.level,
      category: log.category,
      message: log.message,
      model: log.model,
      tokenCount: log.tokenCount,
      duration: log.duration,
      data: {
        ...log.data,
        // Ensure full prompt and content are included
        fullPrompt: log.data?.fullPrompt,
        fullContent: log.data?.fullContent
      }
    }));

    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(fullFilteredLogs, null, 2)).then(() => {
      // Show a temporary success indicator
      setCopiedIndex(-1); // Special index for filtered view
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const runTestAIRequest = async () => {
    setIsTestRunning(true);
    try {
      const response = await fetch('/api/test-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptTemplate: 'This is a test request from the AI log viewer. Please respond with a simple greeting and confirm you received this test message.',
          model: 'gemini-2.0-flash',
          temperature: 0.7,
          contextVars: {},
          currentStageInput: '',
          stageOutputType: 'text'
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Test request failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Test AI request completed:', result);
      
      // Clear error on success
      if (result.success) {
        setError(null);
      }
    } catch (err) {
      console.error('Test AI request failed:', err);
      setError(`Test request failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsTestRunning(false);
    }
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'debug': return 'outline';
      default: return 'default';
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (levelFilter !== 'all' && log.level !== levelFilter) return false;
    if (categoryFilter !== 'all' && log.category !== categoryFilter) return false;
    
    // Type filter for Outgoing/Incoming/Both
    if (typeFilter !== 'all') {
      const isOutgoing = log.data?.requestType === 'OUTGOING';
      const isIncoming = log.data?.responseType === 'INCOMING';
      
      if (typeFilter === 'outgoing' && !isOutgoing) return false;
      if (typeFilter === 'incoming' && !isIncoming) return false;
      if (typeFilter === 'both' && (!isOutgoing && !isIncoming)) return false;
    }
    
    // Enhanced search that includes full data
    if (filter) {
      const searchableText = JSON.stringify(log).toLowerCase() + 
        (log.data?.fullPrompt || '').toLowerCase() + 
        (log.data?.fullContent || '').toLowerCase();
      if (!searchableText.includes(filter.toLowerCase())) return false;
    }
    
    return true;
  }).reverse(); // Show newest logs first

  const categories = Array.from(new Set(logs.map(log => log.category).filter(Boolean)));

  const stats = {
    totalLogs: logs.length,
    errors: logs.filter(log => log.level === 'error').length,
    warnings: logs.filter(log => log.level === 'warning').length,
    totalTokens: logs.reduce((sum, log) => {
      // Check both tokenCount and nested totalTokenCount
      const tokens = log.tokenCount || log.data?.totalTokenCount || 0;
      return sum + tokens;
    }, 0),
    avgDuration: logs.filter(log => log.duration).reduce((sum, log) => sum + (log.duration || 0), 0) / logs.filter(log => log.duration).length || 0
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                AI Log Viewer
                {isStreaming && (
                  <span className="flex items-center gap-1 text-sm font-normal text-green-600">
                    <span className="animate-pulse">●</span>
                    Live
                  </span>
                )}
              </CardTitle>
              <CardDescription>Real-time monitoring of AI operations</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsStreaming(!isStreaming)}
                variant={isStreaming ? 'destructive' : 'default'}
              >
                {isStreaming ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isStreaming ? 'Pause' : 'Start'}
              </Button>
              <Button 
                onClick={() => setAutoScroll(!autoScroll)} 
                variant={autoScroll ? 'default' : 'outline'}
                title={autoScroll ? 'Disable auto-scroll' : 'Enable auto-scroll'}
              >
                <ArrowDownToLine className="w-4 h-4 mr-2" />
                Auto-scroll {autoScroll ? 'On' : 'Off'}
              </Button>
              <Button 
                onClick={runTestAIRequest} 
                variant="outline"
                disabled={isTestRunning}
              >
                <Zap className="w-4 h-4 mr-2" />
                {isTestRunning ? 'Testing...' : 'Test AI'}
              </Button>
              <Button 
                onClick={copyFilteredView} 
                variant="outline"
                disabled={filteredLogs.length === 0}
              >
                {copiedIndex === -1 ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy View ({filteredLogs.length})
                  </>
                )}
              </Button>
              <Button onClick={clearLogs} variant="outline">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button onClick={downloadLogs} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm">Total Logs</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold">{stats.totalLogs}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm">Errors</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold text-destructive">{stats.errors}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm">Total Tokens</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold">{stats.totalTokens.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm">Avg Duration</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold">{stats.avgDuration.toFixed(0)}ms</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search logs (includes full prompts/responses)..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full"
              />
            </div>
            {(filter || typeFilter !== 'all' || levelFilter !== 'all' || categoryFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilter('');
                  setTypeFilter('all');
                  setLevelFilter('all');
                  setCategoryFilter('all');
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            )}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Logs</SelectItem>
                <SelectItem value="outgoing">🚀 Outgoing Only</SelectItem>
                <SelectItem value="incoming">✨ Incoming Only</SelectItem>
                <SelectItem value="both">🚀✨ Request/Response</SelectItem>
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="stream" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stream">Log Stream</TabsTrigger>
              <TabsTrigger value="json">Raw JSON</TabsTrigger>
            </TabsList>
            <TabsContent value="stream" className="mt-4">
              <ScrollArea className="h-[600px] w-full rounded-md border p-4" ref={scrollAreaRef}>
                <div className="space-y-2">
                  {filteredLogs.map((log, index) => (
                    <Card key={`${log.timestamp}-${index}`} className={`p-4 transition-all duration-500 ${index === 0 ? 'animate-slideIn ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          {/* Show request/response type prominently */}
                          {log.data?.requestType === 'OUTGOING' && (
                            <Badge variant="default" className="bg-purple-600 hover:bg-purple-700">
                              🚀 OUTGOING
                            </Badge>
                          )}
                          {log.data?.responseType === 'INCOMING' && (
                            <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                              ✨ INCOMING
                            </Badge>
                          )}
                          {log.level && (
                            <Badge variant={getLevelBadgeVariant(log.level)}>
                              {log.level.toUpperCase()}
                            </Badge>
                          )}
                          {log.data?.workflowName && (
                            <Badge variant="outline" className="text-xs">
                              {log.data.workflowName}
                            </Badge>
                          )}
                          {log.data?.stageName && (
                            <Badge variant="secondary" className="text-xs">
                              {log.data.stageName}
                            </Badge>
                          )}
                          {log.model && <Badge variant="secondary">{log.model}</Badge>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyLogEntry(log, index)}
                            className="h-8 w-8 p-0"
                          >
                            {copiedIndex === index ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm mb-2 font-medium">{log.message}</p>
                      
                      {/* Enhanced data display */}
                      {log.data && (
                        <div className="mt-2 space-y-2">
                          {/* For OUTGOING requests, show full prompt */}
                          {log.data.requestType === 'OUTGOING' && (
                            <>
                              {/* Request metadata */}
                              <div className="flex gap-4 text-xs bg-purple-50 dark:bg-purple-950/30 p-2 rounded">
                                {log.data.model && <span>🤖 Model: {log.data.model}</span>}
                                {log.data.temperature !== undefined && <span>🌡️ Temp: {log.data.temperature}</span>}
                                {log.data.promptLength && <span>📝 Prompt Length: {log.data.promptLength} chars</span>}
                              </div>
                              
                              {/* Context variables */}
                              {log.data.contextVars && log.data.contextVars.length > 0 && (
                                <div className="text-xs bg-muted/50 p-2 rounded">
                                  <span className="font-medium">Context Variables:</span> {log.data.contextVars.join(', ')}
                                </div>
                              )}
                              
                              {/* Full prompt display - auto expanded */}
                              {log.data.fullPrompt && (
                                <div className="mt-2">
                                  <div className="text-xs text-purple-600 font-medium mb-1">
                                    🚀 Full Outgoing Prompt
                                  </div>
                                  <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded">
                                    <div className="text-xs overflow-x-auto max-h-[400px] overflow-y-auto whitespace-pre-wrap font-mono">
                                      {log.data.fullPrompt}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                          
                          {/* For INCOMING responses, show full content */}
                          {log.data.responseType === 'INCOMING' && (
                            <>
                              {/* Token usage display */}
                              {(log.data.promptTokenCount || log.data.candidatesTokenCount) && (
                                <div className="flex gap-4 text-xs bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded">
                                  {log.data.promptTokenCount && <span>📥 Input: {log.data.promptTokenCount} tokens</span>}
                                  {log.data.candidatesTokenCount && <span>📤 Output: {log.data.candidatesTokenCount} tokens</span>}
                                  {log.data.totalTokenCount && <span>📊 Total: {log.data.totalTokenCount} tokens</span>}
                                </div>
                              )}
                              
                              {/* Full response display - auto expanded */}
                              {log.data.fullContent && (
                                <div className="mt-2">
                                  <div className="text-xs text-emerald-600 font-medium mb-1">
                                    ✨ Full Incoming Response
                                  </div>
                                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded">
                                    <div className="text-xs overflow-x-auto max-h-[400px] overflow-y-auto whitespace-pre-wrap font-mono">
                                      {log.data.fullContent}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                          
                          {/* Common fields for both request and response */}
                          
                          {/* Grounding info */}
                          {(log.data.hasGrounding || log.data.hasGroundingMetadata) && (
                            <div className="text-xs text-green-600">
                              🔍 Google Search Grounding {log.data.hasGrounding ? 'Enabled' : 'Detected'}
                            </div>
                          )}
                          
                          {/* Image generation info */}
                          {log.data.provider === 'imagen' && (
                            <div className="text-xs space-y-1">
                              <div>🎨 Image Generation: {log.data.numberOfImages || 1} images</div>
                              {log.data.aspectRatio && <div>📐 Aspect Ratio: {log.data.aspectRatio}</div>}
                            </div>
                          )}
                          
                          {/* Error display */}
                          {log.data.error && (
                            <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                              ❌ Error: {log.data.error}
                            </div>
                          )}
                          
                          {/* Duration */}
                          {log.duration && (
                            <div className="text-xs text-muted-foreground">
                              ⏱️ Duration: {log.duration}ms
                            </div>
                          )}
                          
                          {/* Full raw data view */}
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                              View Raw Log Data
                            </summary>
                            <div className="mt-2 p-3 bg-muted rounded text-xs font-mono max-h-[200px] overflow-y-auto">
                              <div className="break-words whitespace-pre-wrap">
                                {JSON.stringify(log.data, null, 2)}
                              </div>
                            </div>
                          </details>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="json" className="mt-4">
              <div className="h-[600px] w-full rounded-md border overflow-auto">
                <pre className="p-4 text-xs whitespace-pre overflow-x-auto min-w-0">
                  {JSON.stringify(filteredLogs, null, 2)}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}