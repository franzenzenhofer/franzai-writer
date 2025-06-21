import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

// Server-Sent Events helper
function createSSEStream() {
  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController<Uint8Array>;

  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl;
    },
    cancel() {
      // Cleanup when client disconnects
    }
  });

  const send = (data: any) => {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    controller.enqueue(encoder.encode(message));
  };

  const close = () => {
    controller.close();
  };

  return { stream, send, close };
}

// Parse structured log entries (JSON only)
function parseLogEntries(content: string): any[] {
  const entries: any[] = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    // Only parse JSON log entries
    if (line.trim().startsWith('{')) {
      try {
        const entry = JSON.parse(line);
        entries.push(entry);
      } catch (err) {
        // Skip invalid JSON lines
        console.warn('Skipping invalid JSON line:', line.substring(0, 100));
      }
    }
  }
  
  return entries;
}

export async function GET(request: NextRequest) {
  const { stream, send, close } = createSSEStream();
  
  // Log file path
  const logPath = path.join(process.cwd(), 'logs', 'ai.log');
  
  // Create logs directory if it doesn't exist
  const logsDir = path.dirname(logPath);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Create log file if it doesn't exist
  if (!fs.existsSync(logPath)) {
    fs.writeFileSync(logPath, '');
  }
  
  // Read existing logs
  try {
    const existingLogs = fs.readFileSync(logPath, 'utf-8');
    
    // Parse all log entries
    const allEntries = parseLogEntries(existingLogs);
    
    // Send last 100 entries as initial data
    const recentEntries = allEntries.slice(-100);
    for (const entry of recentEntries) {
      send(entry);
    }
  } catch (err) {
    console.error('Error reading existing logs:', err);
  }
  
  // Watch for new log entries
  let fileSize = fs.statSync(logPath).size;
  const watcher = fs.watch(logPath, (eventType) => {
    if (eventType === 'change') {
      const newSize = fs.statSync(logPath).size;
      if (newSize > fileSize) {
        const buffer = Buffer.alloc(newSize - fileSize);
        const fd = fs.openSync(logPath, 'r');
        fs.readSync(fd, buffer, 0, buffer.length, fileSize);
        fs.closeSync(fd);
        
        const newContent = buffer.toString('utf-8');
        
        // Parse new entries
        const newEntries = parseLogEntries(newContent);
        for (const entry of newEntries) {
          send(entry);
        }
        
        fileSize = newSize;
      }
    }
  });
  
  // Handle client disconnect
  request.signal.addEventListener('abort', () => {
    watcher.close();
    close();
  });
  
  // Return SSE response
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Mock endpoint to generate test logs
export async function POST(request: NextRequest) {
  try {
    const { level = 'info', category = 'test', message = 'Test log entry', data } = await request.json();
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      model: data?.model || 'gemini-2.0-flash',
      tokenCount: Math.floor(Math.random() * 1000) + 100,
      duration: Math.floor(Math.random() * 2000) + 100
    };
    
    const logPath = path.join(process.cwd(), 'logs', 'ai.log');
    const logLine = JSON.stringify(logEntry) + '\n';
    
    // Ensure logs directory exists
    const logsDir = path.dirname(logPath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Append to log file
    fs.appendFileSync(logPath, logLine);
    
    return NextResponse.json({ success: true, entry: logEntry });
  } catch (err) {
    console.error('Error writing test log:', err);
    return NextResponse.json({ error: 'Failed to write log' }, { status: 500 });
  }
}