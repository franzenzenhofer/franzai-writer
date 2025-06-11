# Refactor NPM Scripts for Robust Development Management

**Created**: 2025-01-06
**Priority**: High
**Component**: Development Tools / Build System

## Description

Refactor all npm run commands into a comprehensive, robust, and debuggable Node.js runner script system. The goal is to create a Swiss Army knife (`Schweizermesser`) development management tool that provides clear visibility into running services, comprehensive logging, and easy debugging capabilities.

## Current Issues

1. **No unified process management** - Different services run independently without coordination
2. **Limited visibility** - Hard to see what servers are currently active
3. **Scattered logging** - Logs are not centralized or properly managed
4. **No persistent log history** - Logs get lost between restarts
5. **Difficult debugging** - No easy way to trace issues across services

## Requirements

### 1. Unified Development Runner Script
- Create a Node.js-based runner script that manages all development services
- Single entry point: `npm run dev` starts everything
- Graceful shutdown of all services on exit
- Process monitoring and automatic restart on crashes

### 2. Service Status Dashboard
When running `npm run dev`, display:
- All active servers with their ports and status
- Real-time health checks
- Memory and CPU usage per service
- Uptime for each service
- Color-coded status indicators (green = healthy, yellow = warning, red = error)

Example output:
```
🚀 Franz AI Writer Development Environment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Service          Port    Status    Uptime    Memory
─────────────────────────────────────────────────────
Next.js          9002    ✅ Ready   5m 23s    124MB
Genkit AI        9003    ✅ Ready   5m 20s    89MB
Firebase Emu     9099    ✅ Ready   5m 21s    156MB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Press Ctrl+C to stop all services
```

### 3. Comprehensive Logging System

#### Log Directory Structure
```
/logs/
├── current/                    # Current session logs (cleaned on restart)
│   ├── nextjs.log
│   ├── genkit.log
│   ├── firebase.log
│   └── combined.log
├── persistent/                 # Persistent logs
│   └── last-500.log           # Rolling log of last 500 entries
└── archives/                   # Optional: archived logs by date
    └── 2025-01-06/
```

#### Logging Features
- **Automatic cleanup**: Clear `/logs/current/` on each `npm run dev` start
- **Combined logging**: Aggregate all service logs into `combined.log`
- **Persistent history**: Maintain rolling `last-500.log` that persists across restarts
- **Structured logging**: JSON format for easy parsing
- **Log levels**: DEBUG, INFO, WARN, ERROR with color coding
- **Timestamps**: Precise timestamps for all entries
- **Service tagging**: Each log entry tagged with source service

### 4. Development Commands

#### Primary Commands
```json
{
  "scripts": {
    "dev": "node scripts/dev-runner.js",
    "dev:debug": "node scripts/dev-runner.js --debug",
    "dev:verbose": "node scripts/dev-runner.js --verbose",
    "dev:status": "node scripts/dev-runner.js --status",
    "dev:logs": "node scripts/dev-runner.js --logs",
    "dev:clean": "node scripts/dev-runner.js --clean"
  }
}
```

#### Command Options
- `--debug`: Enable Node.js debugging for all services
- `--verbose`: Enable verbose logging
- `--status`: Show current running services without starting new ones
- `--logs`: Tail the combined log file
- `--clean`: Clean all logs and temp files
- `--only=<service>`: Run only specific service(s)
- `--exclude=<service>`: Exclude specific service(s)

### 5. Runner Script Features

#### Core Functionality
```javascript
// scripts/dev-runner.js
class DevRunner {
  constructor() {
    this.services = {
      nextjs: {
        name: 'Next.js',
        command: 'next dev --turbopack',
        port: 9002,
        healthCheck: 'http://localhost:9002/api/health',
        color: 'blue'
      },
      genkit: {
        name: 'Genkit AI',
        command: 'genkit start -- tsx src/ai/dev.ts',
        port: 9003,
        healthCheck: 'http://localhost:9003/health',
        color: 'green'
      },
      firebase: {
        name: 'Firebase Emulator',
        command: 'firebase emulators:start',
        port: 9099,
        healthCheck: 'http://localhost:9099',
        color: 'yellow'
      }
    };
  }
  
  // Methods for process management, logging, monitoring, etc.
}
```

#### Advanced Features
- **Port conflict detection**: Check and handle port conflicts before starting
- **Dependency management**: Start services in correct order
- **Environment validation**: Check required env vars before starting
- **Resource monitoring**: Track memory/CPU usage
- **Crash recovery**: Automatic restart with backoff
- **Signal handling**: Graceful shutdown on SIGINT/SIGTERM

### 6. Debugging Capabilities

- **Unified debugging**: `npm run dev:debug` enables debugging for all services
- **Service-specific debugging**: `npm run dev --debug=nextjs`
- **Log filtering**: Filter logs by service, level, or time range
- **Error aggregation**: Collect and display all errors in one place
- **Performance metrics**: Track response times and bottlenecks

## Implementation Plan

1. **Phase 1**: Create basic runner script with process management
2. **Phase 2**: Implement logging system with cleanup and persistence
3. **Phase 3**: Add status dashboard and monitoring
4. **Phase 4**: Implement advanced features (debugging, filtering, metrics)
5. **Phase 5**: Add tests and documentation

## Technical Considerations

- Use `execa` or `child_process` for process management
- Use `chalk` for colored output
- Use `winston` or similar for structured logging
- Use `blessed` or `ink` for interactive dashboard
- Implement proper error handling and recovery
- Ensure cross-platform compatibility (Windows, macOS, Linux)

## Success Criteria

- [ ] Single `npm run dev` command starts all services
- [ ] Clear visibility of all running services and their status
- [ ] All logs written to `/logs/` with proper organization
- [ ] Last 500 log entries persist across restarts
- [ ] Automatic cleanup of current session logs on restart
- [ ] Graceful shutdown of all services
- [ ] Debugging mode available for all services
- [ ] Documentation for all features
- [ ] Works reliably on all platforms

## Notes

This will significantly improve the developer experience by providing a unified, robust, and debuggable development environment. The "Schweizermesser" (Swiss Army knife) approach means having all necessary tools in one place, easily accessible and well-organized.