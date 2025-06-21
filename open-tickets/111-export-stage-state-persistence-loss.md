# Export Stage State Persistence Loss After Reload – Detailed Analysis

**Created:** 2025-06-21
**Priority:** Critical (P0)
**Component:** Export Stage, Document Persistence
**Type:** Bug / Data-Loss
**Status:** Open
**Affects:** All workflows that include an `export` stage

---

## TL;DR
Reloading the page (or navigating back to a document via a deep link) after the export stage **completed** wipes all export artefacts:

* Styled Preview disappears
* Copy & Download buttons become disabled (no payload)
* Previously generated **publish URL(s)** are lost

This is a *data-loss* bug – users cannot recover their exports without re-running the whole stage, which is unacceptable for production.

---

## 7 × Why – Root Cause Analysis

1. **Why** do preview, buttons and URLs vanish after reload?
   *Because the export stage's `stageState.output` is **missing** when the document is re-hydrated from Firestore.*

2. **Why** is `stageState.output` missing in Firestore?
   *Because the `cleanStageStates()` routine in `src/lib/document-persistence.ts` **strips** almost the entire export output, keeping only a few truncated scalar fields.*

3. **Why** does `cleanStageStates()` strip the export output?
   *Because a previous hot-fix attempted to avoid Firestore's 1 MiB / nested-entity limits by **flattening** everything that looks like an export stage and by throwing away "complex" (nested / large) data.*

4. **Why** was flattening implemented so aggressively for export stages?
   *Because Firestore kept rejecting writes with `INVALID_ARGUMENT: Maximum depth of nested entity exceeded` when raw HTML/Markdown and binary formats were stored unaltered. The fix chose the fastest path: delete/trim deep data instead of moving it elsewhere.*

5. **Why** does trimming break runtime behaviour?
   *Because the UI components (`ExportPreview`, `ExportOptions`, `ExportStageCard`) expect the *full* HTML/Markdown content and format payloads (`content`, `url`) to be present. With only 1 000-char previews and no `content`, buttons and preview logic short-circuit.*

6. **Why** doesn't the UI simply regenerate the exports on reload?
   *Because the stage status is persisted as **`completed`**, so auto-run logic never re-fires; yet the required artefacts are gone.*

7. **Why** was this not detected earlier?  
   *E2E tests cover the "happy path" (fresh export) but not the "reload / deep-link back" scenario. Manual testing focused on generation success, not persistence integrity.*

---

## Required Behaviour (Acceptance Criteria)

* A user who reloads the page **or** opens the document later **must** see the export stage *exactly* as they left it – including:  
  • Styled & Clean HTML previews  
  • Downloadable payloads for every ready format  
  • Working *Copy* buttons (clipboard)  
  • Persisted *publish URL(s)*, QR codes, short URLs, etc.
* No duplicated "re-render" runs should be necessary – persistence must be authoritative.
* Behaviour must hold for **all** export formats (`html-styled`, `html-clean`, `markdown`, `pdf`, `docx`, …) and any future additions.
* Solution must respect Firestore limits **without** data-loss, e.g. by externalising large blobs to Cloud Storage and persisting only references.
* Backward compatibility: existing documents created before the fix should still load (migration strategy required).
* Extensive regression tests:
  * Unit test for persistence layer – ensure round-trip keeps full export data.
  * E2E test that completes export, reloads page, validates preview/buttons/URLs.

---

## Suggested Investigation Focus (do **not** implement yet)

1. Audit `cleanStageStates()` and `cleanExportStageOutput()` – identify exactly which fields are stripped/truncated.
2. Review `reconstructExportStages()` – currently only recreates *truncated* strings and omits `content`. Evaluate feasibility of full reconstruction or alternative storage.
3. Evaluate Firestore document size/bandwidth with realistic export payloads to decide whether to:
   * Store full artefacts inline (if within limits)
   * Offload to Firebase Storage / Cloud Storage and keep URLs
4. Map all code paths that rely on `output.formats[format].content` or `htmlStyled` for UI rendering.
5. Assess impact on existing recovery logic (`resetStuckExportStages`).

---

## Ideal Solution Architecture – **Durable Export Artefact Storage**

The guiding principle is _"keep the heavy stuff out of Firestore, but keep it addressable"_.

### 1. Dedicated Cloud Storage bucket
* Bucket: `exports/{documentId}/{stageId}/`  
  (re-use the same storage used for AI generated images – keeps ACL logic identical).
* File naming convention per format:  
  `html-styled.html`, `html-clean.html`, `markdown.md`, `export.pdf`, `export.docx`, etc.
* Upload happens **server-side** during export generation **before** the stage is marked `completed`.

### 2. ExportStageState schema changes
```ts
output: {
  htmlStyledUrl?: string;   // public or signed URL – replaces raw htmlStyled
  htmlCleanUrl?: string;
  markdownUrl?: string;
  formats: {
    [format: string]: {
      ready: boolean;
      storagePath?: string; // `exports/…`
      url?: string;         // gets filled by Cloud Storage signed URL helper
      sha256?: string;      // (optional) integrity check
      sizeBytes?: number;   // (optional) analytics & quota tracking
    };
  };
  publishing?: { … } // unchanged
}
```
* **No** large `content` blobs in Firestore – only lightweight metadata.
* For text formats we _may_ cache the first 4–8 kB inline for fast preview/search indexing.

### 3. Document-persistence adjustments
* `cleanExportStageOutput()` now **keeps** the lightweight metadata (it is already scalar).
* Firestore write failures due to size/nesting disappear.

### 4. Reconstruction logic on load
1. `reconstructExportStages()` detects `…Url` fields.  
2. UI components fetch the file lazily:  
   *For previews*: fetch only when the card becomes visible.  
   *For copy/download*: fetch on-demand and pipe to clipboard / blob download.
3. If fetch fails → show "missing artefact" message & offer *Regenerate*.

### 5. Security & Access Control
* Same Storage rules as images: `userId === request.auth.uid` OR the file is in a published folder.
* For public publish URLs we can move/copy the files to `public/{publishId}/` or issue long-lived signed URLs.

### 6. Migration Strategy
* **Automatic background job** (`scripts/migrate-flattened-exports.ts`):  
  1. Scan documents with truncated export output.  
  2. Re-run export generation in headless mode _or_ attempt to locate existing artefact backups.  
  3. Upload to Storage and patch Firestore records with metadata only.
* Mark any failed migrations as `isStale = true` so UI suggests regeneration.

### 7. Developer Experience & Testing
* Unit tests: storage upload helper, persistence round-trip keeps metadata intact.
* E2E: complete export → reload → preview & download still work (uses Storage network requests).
* Local dev: fall back to `storage-emulator` bucket automatically.

### 8. Open Questions (to finalise in implementation ticket)
* Signed URL TTL – 1 h vs 24 h vs "forever".
* Should we compress HTML/Markdown before upload?
* Do we need versioning (re-exports) or overwrite in place?

_This architecture fulfils the acceptance criteria while staying within Firestore's limits and leveraging infrastructure we already operate._

---

## Risks & Considerations

* Firestore 1 MiB limit – storing large HTML or base64 PDF blobs inline is risky.
* Security of public URLs when export is unpublished yet stored externally.
* Migration of existing flattened records could be non-trivial.
* Potential performance hit when loading large artefacts from external storage.

---

## Next Steps (Implementation ticket will follow)

1. Decide on a *storage strategy* that keeps data safe but Firestore-friendly (e.g., Cloud Storage + signed URLs).
2. Refactor persistence cleaning to **preserve** essential fields (either full payload or durable reference).
3. Extend reconstruction logic to fully hydrate UI with stored payload.
4. Add regression tests (unit + E2E) covering reload/deep-link scenarios.

---

*This ticket documents root-cause analysis and desired behaviour only. Implementation details will be handled in a follow-up ticket once the strategy is agreed.* 