# AI Log Viewer

A real-time monitoring tool for viewing AI operations and logs in Franz AI Writer.

## Features

- **Real-time Streaming**: Live updates of AI operations as they happen
- **Filtering**: Filter logs by level (info, warning, error, debug) and category
- **Search**: Full-text search across all log entries
- **Statistics**: View total logs, errors, token usage, and average response times
- **Export**: Download logs as JSON for offline analysis
- **Dual View**: Switch between formatted log stream and raw JSON view

## Accessing the Log Viewer

1. Navigate to `/debug/ai-log-viewer` in your browser
2. Or click "AI Logs" in the main navigation menu

## Log Categories

- **ai-request**: Outgoing AI model requests
- **ai-response**: AI model responses
- **grounding**: Google Search grounding metadata
- **thinking**: Thinking mode analysis (Gemini 2.5)
- **image-generation**: Image generation requests and results
- **general**: General AI operations

## Testing the Log Viewer

Generate test logs to see the viewer in action:

```bash
node test-scripts/test-ai-log-viewer.mjs
```

## Log Format

Logs are stored as structured JSON entries in `logs/ai.log`:

```json
{
  "timestamp": "2025-01-06T12:34:56.789Z",
  "level": "info",
  "category": "ai-request",
  "message": "AI Request to gemini-2.0-flash",
  "data": {
    "model": "gemini-2.0-flash",
    "temperature": 0.7,
    "promptLength": 1500
  },
  "model": "gemini-2.0-flash",
  "tokenCount": 1250,
  "duration": 1834
}
```

## Implementation Details

- **Frontend**: React component with real-time EventSource streaming
- **Backend**: Server-Sent Events (SSE) API endpoint
- **Storage**: Logs are appended to `logs/ai.log` file
- **File Watching**: Uses Node.js fs.watch to detect new log entries

The log viewer is completely modular and independent, making it easy to extend or modify without affecting the rest of the application.