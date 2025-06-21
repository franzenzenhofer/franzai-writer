# Ticket #118: Complete Poem Workflow - Critical Fixes for Production

**Created:** 2025-06-21  
**Priority:** CRITICAL (P0)  
**Type:** Bug Fixes & Feature Completion  
**Components:** Export Stage, Document Persistence, UI/UX, Button Design  
**Status:** Open

## Executive Summary

The poem workflow example needs several critical fixes to work properly end-to-end. While basic functionality exists, there are showstopper bugs that prevent users from completing the workflow successfully, especially after page reloads.


### 3. Phantom "Update Recommended" Bug (Ticket #114) - HIGH
**Problem**: Never-executed export stages incorrectly show "Update recommended" after reload
- Shows stale warning for content that was never generated
- Invalid state combination (completed but no output)
- Confuses users about what needs to be done

**Required Fix**:
- Add state validation to prevent invalid combinations
- Fix staleness logic to only apply to truly completed stages
- Ensure idle stages remain idle after reload



