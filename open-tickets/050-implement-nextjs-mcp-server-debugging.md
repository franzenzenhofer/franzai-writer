# 050 - Implement Next.js MCP Server for Debugging

## Created: 2025-01-06
## Priority: High
## Component: Developer Tools / MCP Integration

## Description
Implement a Model Context Protocol (MCP) server for Next.js debugging that enables Claude Code and other MCP clients to interact with the development environment, access build errors, inspect routes, and debug the application through a standardized protocol.

## Business Case
- Enable AI-assisted debugging through Claude Code integration
- Provide standardized access to Next.js development tools
- Improve developer experience with automated error detection and resolution
- Create a reusable debugging interface for various MCP clients

## Research Findings

### 1. MCP Implementation Approaches
Based on research, there are three main approaches:

#### A. Vercel MCP Adapter (Recommended)
- **Pros**: Official support, handles transport complexity, integrates with Next.js app router
- **Cons**: Requires Redis for SSE transport, limited documentation
- **Implementation**: Uses dynamic route `app/api/[transport]/route.ts`

#### B. Custom HTTP Implementation
- **Pros**: Full control, no external dependencies, simpler deployment
- **Cons**: More code to maintain, need to handle protocol details
- **Implementation**: Standard Next.js API route with JSON-RPC handling

#### C. Standalone MCP Server
- **Pros**: Runs separately from Next.js, can use stdio transport
- **Cons**: Additional process to manage, more complex setup

### 2. Key Technical Considerations

#### Transport Selection
- **HTTP Transport**: Best for stateless operations, serverless-friendly
- **SSE Transport**: Requires persistent connections and Redis
- **Stdio Transport**: Only for local/standalone servers

#### Protocol Requirements
- Must implement JSON-RPC 2.0
- Support initialize, tools/list, and tools/call methods
- Handle protocol version negotiation (YYYY-MM-DD format)
- All logs must go to stderr, not stdout

### 3. Debugging Features to Implement

Based on best practices research:
- **Build Error Detection**: Tool to fetch current build/compile errors
- **Route Analysis**: List all routes with methods and parameters
- **Component Tree Inspection**: Analyze React component hierarchy
- **Performance Metrics**: Memory usage, render times, bundle sizes
- **Log Streaming**: Real-time access to server and client logs
- **State Inspection**: View current application state

## Recommended Implementation Plan

### Phase 1: Basic MCP Server
1. Use Vercel MCP Adapter for quickest implementation
2. Implement minimal tool set:
   - `get_build_errors`: Fetch current TypeScript/build errors
   - `list_routes`: List all Next.js routes
   - `get_server_logs`: Fetch recent server logs

### Phase 2: Enhanced Debugging Tools
1. Add advanced tools:
   - `analyze_bundle`: Check bundle sizes and dependencies
   - `inspect_component`: Get component props and state
   - `profile_performance`: Run performance analysis
2. Implement prompts for common debugging scenarios

### Phase 3: Integration & Polish
1. Add MCP Inspector support for testing
2. Create comprehensive documentation
3. Add error handling and graceful degradation

## Technical Architecture

### File Structure
```
src/
├── app/
│   └── api/
│       └── [transport]/
│           └── route.ts          # MCP endpoint
├── lib/
│   └── mcp/
│       ├── tools/               # MCP tool implementations
│       │   ├── build-tools.ts
│       │   ├── route-tools.ts
│       │   └── debug-tools.ts
│       └── utils/
│           └── nextjs-helpers.ts
└── scripts/
    └── test-mcp.mjs            # Test client
```

### Dependencies
```json
{
  "@vercel/mcp-adapter": "^0.10.0",
  "@modelcontextprotocol/sdk": "1.12.0",
  "zod": "^3.24.2"
}
```

### Configuration
```typescript
// app/api/[transport]/route.ts
const handler = createMcpHandler(
  (server) => {
    // Register debugging tools
    server.tool('get_build_errors', 'Get current build errors', {}, 
      async () => getBuildErrors()
    );
    
    server.tool('list_routes', 'List all Next.js routes', {},
      async () => analyzeRoutes()
    );
  },
  {},
  {
    basePath: '/api',
    verboseLogs: true,
    maxDuration: 60
  }
);
```

## Implementation Notes

### Error Handling
- Wrap all tool logic in try/catch blocks
- Return JSON-RPC compliant error responses
- Log errors to stderr with context

### Testing Strategy
1. Unit tests for individual tools
2. Integration tests using MCP Inspector
3. E2E tests with actual Claude Code client

### Security Considerations
- MCP server should only be available in development
- Implement rate limiting if exposed
- Sanitize any file paths in responses

## Acceptance Criteria

1. **Basic Functionality**
   - [ ] MCP server responds to initialize requests
   - [ ] Tools are listed correctly via tools/list
   - [ ] Basic debugging tools work (errors, routes, logs)

2. **Developer Experience**
   - [ ] MCP Inspector can connect and test all tools
   - [ ] Clear documentation with examples
   - [ ] Helpful error messages

3. **Integration**
   - [ ] Claude Code can connect to the server
   - [ ] Tools provide actionable debugging information
   - [ ] Server handles errors gracefully

## References
- [Vercel MCP Adapter](https://github.com/vercel/mcp-adapter)
- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [Debugging MCP Servers Guide](https://www.mcpevals.io/blog/debugging-mcp-servers-tips-and-best-practices)
- [Next.js MCP Integration Guide](https://markaicode.com/model-context-protocol-nextjs-15-integration-guide)

## Alternative Approaches

### Simple HTTP Implementation (Without Adapter)
If the Vercel adapter proves problematic:

```typescript
// app/api/mcp/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  switch (body.method) {
    case 'initialize':
      return NextResponse.json({
        jsonrpc: '2.0',
        result: {
          protocolVersion: '1.0.0',
          capabilities: { tools: { supported: true } }
        },
        id: body.id
      });
    // ... handle other methods
  }
}
```

This approach is simpler but requires manual protocol implementation.

## Next Steps
1. Create a proof-of-concept with basic tools
2. Test with MCP Inspector
3. Iterate based on debugging needs
4. Document setup process for team