# Server-Side Export Architecture

This document outlines the architecture of the server-centric export system, designed to provide reliable and resumable export functionality.

## Overview

The previous client-side export process was susceptible to interruptions, such as page reloads, which could leave export stages in a permanently "stuck" state. The new architecture mitigates this by delegating the core export work to a server-side background process. The client's role is to initiate the export, monitor its progress, and display the results.

## Core Flow

1.  **Initiation (Client-Side):**
    *   The user triggers an export from the UI (e.g., in `WizardShell`).
    *   The client makes a POST request to the `/api/export/start` API endpoint, providing `documentId` and `stageId`.

2.  **Job Creation (API - `src/app/api/export/start/route.ts`):**
    *   The API endpoint receives the request.
    *   It authenticates and authorizes the user.
    *   It generates a unique `jobId`.
    *   A new job document is created in Firestore under `documents/{documentId}/jobs/{jobId}`. This document initially has a status of `queued` and includes details like `documentId`, `stageId`, `createdBy`, and timestamps.
    *   The API responds to the client with the `jobId`.

3.  **Client-Side State Update & Polling:**
    *   The client receives the `jobId`.
    *   It updates its local stage state to include this `exportJobId` and sets an initial status (e.g., `queued`).
    *   The `useExportJobPolling` React hook (in `src/hooks/use-export-job-polling.ts`) is activated for the given `documentId` and `jobId`.
    *   This hook establishes a real-time listener (using Firestore's `onSnapshot`) to the specific job document.

4.  **Background Processing (Cloud Function & Server Logic):**
    *   **Trigger:** A Firebase Cloud Function, `onExportJobCreated` (defined in `src/lib/export/jobs/export-job-worker.ts`), is triggered automatically when a new document appears in any `jobs` subcollection.
    *   **Execution:** The Cloud Function invokes the `runExportJob` utility (from `src/lib/export/jobs/runExportJob.ts`).
    *   **`runExportJob` Logic:**
        *   Fetches the main document, workflow definition, and all stage states.
        *   Updates the job document in Firestore to `status: 'running'` and sets initial progress.
        *   Performs the core export tasks:
            *   Generates HTML content using `generateExportHtml`.
            *   Processes various output formats (Markdown, PDF, etc.) using `processExportFormats`.
        *   Continuously updates the job document in Firestore with progress percentage and status.
        *   On successful completion, updates the job to `status: 'completed'`, stores the final export output (e.g., URLs to generated files, or content itself) in the job document, and sets progress to `100%`.
        *   If an error occurs, updates the job to `status: 'error'` and stores the error message.

5.  **UI Updates (Client-Side):**
    *   As the `useExportJobPolling` hook receives updates from Firestore about the job document, it calls a callback function (`updateStageState` in `WizardShell`).
    *   The UI reflects these changes, showing the current status (e.g., "Processing: 50%", "Completed", "Error") and eventually displaying the export results or error messages.

## Key Components

*   **API Route (`src/app/api/export/start/route.ts`):** Handles initial export requests and job registration.
*   **Server-Side Job Logic (`src/lib/export/jobs/runExportJob.ts`):** Contains the core logic for performing the export.
*   **Background Worker (`src/lib/export/jobs/export-job-worker.ts`):** A Firebase Cloud Function that listens for new jobs and orchestrates their execution using `runExportJob`.
*   **Client-Side Polling Hook (`src/hooks/use-export-job-polling.ts`):** Enables the UI to reactively display the status and results of the server-side export job.
*   **Firestore `jobs` Subcollection:** Stores the state, progress, and results of each export job, acting as the source of truth.
*   **Types (`src/types/index.ts`):** Includes `ExportJob` and updated `StageState` (with `exportJobId`).
*   **Persistence (`src/lib/document-persistence.ts`):** Ensures `exportJobId` is correctly saved with the document's stage states.

## How This Solves Page Reload Issues

*   **Decoupling:** The actual export work is done on the server, independent of the client's browser session.
*   **State Persistence:** The `exportJobId` is saved in the client's stage state. When the page reloads, the `WizardShell` initializes, and the `useExportJobPolling` hook is activated for any export stage that has an `exportJobId`.
*   **Resumable Monitoring:** The client can immediately start monitoring the existing server job's status by listening to the corresponding Firestore job document. It doesn't need to re-initiate the job, only reconnect to the ongoing (or completed) process.

This architecture ensures a more robust and reliable export experience.
