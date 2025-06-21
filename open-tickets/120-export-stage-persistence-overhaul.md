# 120 – Export & Publish Stage: Persistence and Preview Overhaul

> **Epic:** 112-119
> **Author:** AI pair-programmer
> **Date:** 2025-06-21

## Problem

The *Export & Publish* stage still loses state on a fast page reload because the heavy-data
stage is written to Firestore only after a 2 s auto-save debounce.  As a result:

* Live preview HTML URLs are not persisted ⇒ preview frame is blank after reload.
* `output.publishing` (Published Successfully banner) is dropped ⇒ Publish to Web
  panel shows initial state again.
* Developers have added piecemeal fixes; the code is no longer KISS/DRY.

## Goal

Implement a **single, deterministic** flow that guarantees:

1. All export assets are stored in Firebase Storage only (never inline in Firestore).
2. A *compact scalar summary* of the export state (URLs, sizes, publish info) is
   written to Firestore **immediately** when it changes.
3. `reconstructExportStages()` inflates that summary on load so the UI renders
   identical to the pre-reload view.
4. Live preview always fetches via `/api/fetch-url` (no direct CORS calls).
5. Add automated tests that reload instantly and assert preview & banner remain.

## Deliverables / TODO

- [ ] **Contract** – Finalise `ExportOutput` TypeScript interface in `types/index.ts`.
- [ ] **Server** – `executeExportStage` returns `ExportOutput` (no inline blobs).
- [ ] **Client save logic**
  - [ ] In `WizardShell.updateStageState`, call `saveDocument()` *synchronously*
        whenever:
        ```ts
        stage.stageType === 'export' && (
          updates.status === 'completed' ||
          updates.output?.publishing ||
          updates.output?.formats
        )
        ```
- [ ] **Flatten → Reconstruct**
  - [ ] Update `cleanStageStates()` to store only scalar fields from
        `ExportOutput`.
  - [ ] Ensure `reconstructExportStages()` restores every field, including
        `output.publishing`.
- [ ] **ExportPreview**
  - [ ] Remove direct `fetch(url)` path; always proxy through `/api/fetch-url`.
  - [ ] Log each proxy request (`[ExportPreview] Proxy fetching:`) for debugging.
- [ ] **Wiring**
  - [ ] Pass `onUpdateStageState` from `StageCard` to `WizardShell.updateStageState`.
  - [ ] Ensure `handlePublish()` invokes it once with the full `publishing` object.
- [ ] **E2E Tests** (`tests/e2e`)
  - [ ] `export-survives-reload.spec.ts` – run workflow, export, reload within
        100 ms, assert preview `<h1>` exists.
  - [ ] `publish-survives-reload.spec.ts` – publish, reload, assert banner text.
- [ ] **Docs** – Update `docs/blueprint.md` with the new persistence contract.

## Acceptance Criteria

* Reloading immediately after export completion shows a filled preview & banner.
* Firestore `documents/{docId}` contains **only** scalar fields (no HTML blobs).
* Proxy endpoint is the sole fetch path for HTML.
* New Playwright tests pass in CI.
* No duplicate persistence code; all logic resides in one helper.

---

**Priority:** High (blocks epics 117-119 release)

**Estimate:** 2 Dev days (incl. tests) 