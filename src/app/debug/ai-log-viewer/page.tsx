'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pause, Play, RefreshCw, Download, Trash2, Search, Filter, ArrowDownToLine, TestTube } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

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
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
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
    if (filter && !JSON.stringify(log).toLowerCase().includes(filter.toLowerCase())) return false;
    return true;
  });

  const categories = Array.from(new Set(logs.map(log => log.category).filter(Boolean)));

  const stats = {
    totalLogs: logs.length,
    errors: logs.filter(log => log.level === 'error').length,
    warnings: logs.filter(log => log.level === 'warning').length,
    totalTokens: logs.reduce((sum, log) => sum + (log.tokenCount || 0), 0),
    avgDuration: logs.filter(log => log.duration).reduce((sum, log) => sum + (log.duration || 0), 0) / logs.filter(log => log.duration).length || 0
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>AI Log Viewer</CardTitle>
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
                <TestTube className="w-4 h-4 mr-2" />
                {isTestRunning ? 'Testing...' : 'Test'}
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
                placeholder="Search logs..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full"
              />
            </div>
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
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {log.level && (
                            <Badge variant={getLevelBadgeVariant(log.level)}>
                              {log.level.toUpperCase()}
                            </Badge>
                          )}
                          {log.category && <Badge variant="outline">{log.category}</Badge>}
                          {log.model && <Badge variant="secondary">{log.model}</Badge>}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{log.message}</p>
                      {log.tokenCount && (
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Tokens: {log.tokenCount}</span>
                          {log.duration && <span>Duration: {log.duration}ms</span>}
                        </div>
                      )}
                      {log.data && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-muted-foreground">View Data</summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="json" className="mt-4">
              <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                <pre className="text-xs">
                  {JSON.stringify(filteredLogs, null, 2)}
                </pre>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}