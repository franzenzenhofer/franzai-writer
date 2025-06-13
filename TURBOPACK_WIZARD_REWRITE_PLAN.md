# TURBOPACK WIZARD REWRITE PLAN

## EPIC: Reimplement Wizard View Under /e/ Route with Full Turbopack Compatibility

### CRITICAL RULES:
1. **ALWAYS KILL AND RESTART THE SERVER WHEN IT HANGS**
2. Test after EVERY single change with: `curl -s --max-time 5 http://localhost:9002/e/poem/test`
3. NO server components importing client components
4. NO client components importing server actions directly
5. NO barrel exports in critical paths
6. NO module-level side effects in imported modules

### Phase 1: Research & Understanding (30 min)
- [ ] Research "Next.js 15 Turbopack server client boundary"
- [ ] Research "Turbopack compilation hang client component"
- [ ] Research "Next.js server actions Turbopack issues"
- [ ] Find working examples of complex Next.js 15 + Turbopack apps
- [ ] Document all findings in a TURBOPACK_LEARNINGS.md file

### Phase 2: Architecture Design (20 min)
- [ ] Design data flow that avoids server/client import issues:
  - Server page.tsx → API route → Client component
  - Client component → fetch() → API route → Server logic
- [ ] Map out component hierarchy with ZERO cross-boundary imports
- [ ] Plan how to handle server actions without direct imports
- [ ] Document architecture in TURBOPACK_ARCHITECTURE.md

### Phase 3: Implementation - Foundation (Step by Step)
1. **Create base route structure**
   - [ ] Create `/e/[shortName]/[documentId]/page.tsx` - MINIMAL server component
   - [ ] Test with curl - MUST return 200
   - [ ] Add basic HTML return
   - [ ] Test again - MUST work

2. **Create API routes for data fetching**
   - [ ] Create `/api/wizard/load/[documentId]/route.ts` for document loading
   - [ ] Create `/api/wizard/workflow/[shortName]/route.ts` for workflow loading
   - [ ] Test both API routes independently
   - [ ] NO complex imports, just basic JSON responses first

3. **Create client-only wizard container**
   - [ ] Create `/e/[shortName]/[documentId]/wizard-client.tsx` with "use client"
   - [ ] Start with just a div saying "Wizard loading..."
   - [ ] Import into page.tsx
   - [ ] Test - MUST work
   - [ ] Add useState for wizard data
   - [ ] Test - MUST work

4. **Add data fetching to client**
   - [ ] Add useEffect to fetch from API routes
   - [ ] Display loading state
   - [ ] Test - MUST work
   - [ ] Display fetched data
   - [ ] Test - MUST work

### Phase 4: Implementation - Core Features
5. **Implement wizard UI without server actions**
   - [ ] Copy wizard-shell.tsx to wizard-shell-client.tsx
   - [ ] Remove ALL server action imports
   - [ ] Replace runAiStage with fetch() to API endpoint
   - [ ] Test basic rendering - MUST work

6. **Create API route for AI execution**
   - [ ] Create `/api/wizard/execute/route.ts`
   - [ ] Import server-side AI logic ONLY here
   - [ ] Return JSON response
   - [ ] Test API route independently

7. **Connect client to AI API**
   - [ ] Update wizard-shell-client to use fetch() instead of server actions
   - [ ] Add proper error handling
   - [ ] Test AI stage execution - MUST work

### Phase 5: Implementation - Supporting Features
8. **Port remaining features**
   - [ ] Document persistence via API routes
   - [ ] Auth checking via API routes
   - [ ] File uploads via API routes
   - [ ] Test each feature individually

9. **Polish and optimize**
   - [ ] Add proper TypeScript types
   - [ ] Add loading skeletons
   - [ ] Add error boundaries
   - [ ] Ensure all features work

### Phase 6: Testing & Validation
- [ ] Full workflow test: Create new document
- [ ] Full workflow test: Load existing document
- [ ] Full workflow test: Execute all stages
- [ ] Full workflow test: Save and reload
- [ ] Performance test: Ensure no slow compilations

### Success Criteria:
1. `/e/poem/new` loads without hanging
2. `/e/poem/[documentId]` loads without hanging
3. All wizard features work identically to `/w/` route
4. Turbopack NEVER hangs during development
5. Clean architecture with clear boundaries

### Key Architectural Decisions:
1. **Data Flow**: Server → API Routes → Client → API Routes → Server
2. **No Direct Server Action Imports**: Use fetch() to API routes instead
3. **Minimal Server Components**: Only for initial page render
4. **Client-Side State Management**: All interactive logic in client components
5. **API Routes as Bridge**: All server logic isolated in API routes

### Common Pitfalls to Avoid:
1. Importing firebase.ts in client components that are imported by server components
2. Using server actions in client components without proper isolation
3. Barrel exports that mix server and client code
4. Module-level initialization that runs on import
5. Complex import chains that cross server/client boundaries