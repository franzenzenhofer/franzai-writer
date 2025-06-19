// tests/unit/lib/export/jobs/ExportJobService.spec.ts
import { ExportJobService } from '@/lib/export/jobs/ExportJobService';
import { firestoreAdapter } from '@/lib/firestore-adapter';
import type { ExportStageState, ExportJobCompleted, ExportJobError, ExportJobRunning } from '@/types';

jest.mock('@/lib/firestore-adapter');

describe('ExportJobService', () => {
  const mockDocumentId = 'doc123';
  const mockJobId = 'job456';

  beforeEach(() => {
    jest.clearAllMocks();
    (firestoreAdapter.updateDocument as jest.Mock).mockResolvedValue(undefined);
  });

  test('startJob should call updateDocument with correct running status payload', async () => {
    await ExportJobService.startJob(mockDocumentId, mockJobId);
    expect(firestoreAdapter.updateDocument).toHaveBeenCalledWith(
      `documents/${mockDocumentId}/jobs`,
      mockJobId,
      expect.objectContaining({
        status: 'running',
        progress: 5,
        error: undefined,
        output: undefined,
        updatedAt: expect.any(String),
      })
    );
  });

  test('updateProgress should call updateDocument with new progress', async () => {
    await ExportJobService.updateProgress(mockDocumentId, mockJobId, 50);
    expect(firestoreAdapter.updateDocument).toHaveBeenCalledWith(
      `documents/${mockDocumentId}/jobs`,
      mockJobId,
      expect.objectContaining({
        progress: 50,
        updatedAt: expect.any(String),
      })
    );
  });

  test('updateProgress should clamp progress to 0-100', async () => {
    await ExportJobService.updateProgress(mockDocumentId, mockJobId, 150);
    expect(firestoreAdapter.updateDocument).toHaveBeenCalledWith(
      `documents/${mockDocumentId}/jobs`, mockJobId, expect.objectContaining({ progress: 100, updatedAt: expect.any(String) })
    );
    await ExportJobService.updateProgress(mockDocumentId, mockJobId, -50);
    expect(firestoreAdapter.updateDocument).toHaveBeenCalledWith(
      `documents/${mockDocumentId}/jobs`, mockJobId, expect.objectContaining({ progress: 0, updatedAt: expect.any(String) })
    );
  });

  test('completeJob should call updateDocument with correct completed status payload', async () => {
    const mockOutput: ExportStageState['output'] = { htmlStyled: 'done', formats: {} } as any; // Cast for simplicity
    await ExportJobService.completeJob(mockDocumentId, mockJobId, mockOutput);

    // Using Pick<> to match the service method's payload construction before adding updatedAt
    const expectedPayload: Pick<ExportJobCompleted, 'status' | 'progress' | 'output' | 'error'> = {
        status: 'completed',
        progress: 100,
        output: mockOutput,
        error: undefined,
    };
    expect(firestoreAdapter.updateDocument).toHaveBeenCalledWith(
      `documents/${mockDocumentId}/jobs`,
      mockJobId,
      expect.objectContaining({
        ...expectedPayload,
        updatedAt: expect.any(String)
      })
    );
  });

  test('failJob should call updateDocument with correct error status payload', async () => {
    const errorMessage = 'Test error';
    await ExportJobService.failJob(mockDocumentId, mockJobId, errorMessage, 40);

    const expectedPayload: Pick<ExportJobError, 'status' | 'error' | 'output' | 'progress'> = {
        status: 'error',
        error: errorMessage,
        output: undefined,
        progress: 40
    };
    expect(firestoreAdapter.updateDocument).toHaveBeenCalledWith(
      `documents/${mockDocumentId}/jobs`,
      mockJobId,
      expect.objectContaining({
        ...expectedPayload,
        updatedAt: expect.any(String)
      })
    );
  });

  test('failJob should use -1 progress if not provided', async () => {
    await ExportJobService.failJob(mockDocumentId, mockJobId, 'Test error');
    expect(firestoreAdapter.updateDocument).toHaveBeenCalledWith(
      `documents/${mockDocumentId}/jobs`, mockJobId, expect.objectContaining({ progress: -1, updatedAt: expect.any(String) })
    );
  });

  test('updateJob should throw if firestoreAdapter.updateDocument fails', async () => {
    const firestoreError = new Error('Firestore unavailable');
    (firestoreAdapter.updateDocument as jest.Mock).mockRejectedValue(firestoreError);
    await expect(ExportJobService.updateJob(mockDocumentId, mockJobId, { progress: 10 }))
      .rejects.toThrow(`Failed to update job ${mockJobId}: Firestore unavailable`);
  });

  test('cancelJob should call updateDocument with correct cancelled status payload', async () => {
    const reason = "User cancelled";
    await ExportJobService.cancelJob(mockDocumentId, mockJobId, reason);
    expect(firestoreAdapter.updateDocument).toHaveBeenCalledWith(
      `documents/${mockDocumentId}/jobs`,
      mockJobId,
      expect.objectContaining({
        status: 'cancelled',
        error: reason,
        output: undefined,
        updatedAt: expect.any(String),
      })
    );
  });
});
