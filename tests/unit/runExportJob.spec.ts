// tests/unit/runExportJob.spec.ts
import { runExportJob } from '@/lib/export/jobs/runExportJob';
import { ExportJobService } from '@/lib/export/jobs/ExportJobService';
import type { Workflow, StageState, ExportConfig, HtmlGenerationResult, ProcessedFormats, ValidatedExportData, ExportStageState } from '@/types'; // Assuming ValidatedExportData is from types or local

// Mock ExportJobService
jest.mock('@/lib/export/jobs/ExportJobService');

// Mock the internal helper functions.
// This requires that these functions are either exported from runExportJob.ts (if they aren't already)
// or we mock the module containing them if they were extracted to a utils file.
// For this example, we'll assume they are part of the same module and we are selectively mocking them.
// This is a more advanced Jest technique. If helpers were in a separate file 'runExportJob.utils.ts',
// mocking would be `jest.mock('@/lib/export/jobs/runExportJob.utils');`
// And then `import { fetchAndValidateExportData, ... } from '@/lib/export/jobs/runExportJob.utils';`
// For same-module mocking, it's more complex. The most straightforward way is to refactor helpers
// to a utils file.
// HOWEVER, the task implies testing runExportJob as a unit and mocking its internal steps.
// So, we will mock the functions that *would be* imported if they were in a utils file.
// This means the actual runExportJob.ts would need to be structured to import these,
// or these mocks won't apply directly to non-exported inner functions.

// Let's assume for the test that runExportJob.ts was structured like:
// import * as helpers from './runExportJob.helpers'; // and then calls helpers.fetchAndValidateExportData etc.
// jest.mock('./runExportJob.helpers');

// For the purpose of this test, we will mock the dependencies *as if* they were imported.
// The actual implementation of runExportJob.ts calls these functions directly.
// This test will therefore reflect how runExportJob *should* behave if these were external dependencies.

const mockFetchAndValidateExportData = jest.fn();
const mockGenerateHtmlForExportStep = jest.fn();
const mockProcessFormatsForExportStep = jest.fn();

// This is the tricky part: For same-file functions, direct mocking is hard.
// A common pattern is to spyOn and mockImplementation if they are methods of a class,
// or if they are exported and then re-imported within the same module for testing.
//
// Given the current structure of runExportJob.ts (helpers are not exported),
// these mocks below won't directly intercept calls from runExportJob to its internal helpers.
// The test will act as if they *were* intercepted.
// A true test of this structure would require refactoring runExportJob.ts to allow DI or exporting helpers.

// Instead of mocking the helpers directly (which is hard for non-exported, same-file functions),
// we will test the main runExportJob function and assert its interactions with ExportJobService.
// The internal logic (calling the actual, non-mocked helpers) will run, and we'll mock the
// results of those helpers at the boundary where they call external services (which are already mocked
// by the old test, e.g. firestoreAdapter, generateExportHtml, processExportFormats).

// The new approach for testing runExportJob is to verify its orchestration of calls to ExportJobService
// and to the (now refactored) helper steps. So we need to mock the helper steps.
// The most robust way to do this is to assume they *could* be imported, and mock them as such.
// For this file, we'll use a simplified approach: we'll mock the modules that the *original* runExportJob depended on,
// and assert that the new *internal* helper functions (if they were to throw errors) correctly result
// in calls to ExportJobService.failJob.

// Let's clean this up. The refactored runExportJob now calls helpers that call the external services.
// We need to mock the helpers.
// To do this properly, runExportJob.ts would need to be written to allow these helpers to be mocked.
// E.g., by exporting them, or putting them in a separate utils file.
// Let's write the tests assuming they *are* mockable (e.g. from a utils file).

jest.mock('@/lib/firestore-adapter'); // Mock for fetchAndValidate (if it still uses it directly)
jest.mock('@/lib/export/ai-html-generator');
jest.mock('@/lib/export/format-converters');


describe('runExportJob (Refactored)', () => {
  const mockJobId = 'job123';
  const mockDocumentId = 'doc456';
  const mockStageId = 'export-stage-def';

  const mockValidExportConfig: ExportConfig = { formats: { markdown: { enabled: true, label: 'Markdown', description: ''} } };
  const mockWorkflow: Workflow = {
    id: 'wf1', name: 'Test WF', description: '', stages: [{ id: mockStageId, title: 'Export', description:'', stageType: 'export', inputType: 'none', outputType: 'export-interface', exportConfig: mockValidExportConfig }],
    defaultModel: '', temperature: 0.7
  };
  const mockStageStates: Record<string, StageState> = { [mockStageId]: { status: 'idle', stageId: mockStageId }};

  const mockValidatedData: ValidatedExportData = {
    workflow: mockWorkflow,
    allStageStates: mockStageStates,
    exportStage: mockWorkflow.stages[0],
  };

  const mockHtmlResult: HtmlGenerationResult = { htmlStyled: '<p>Styled</p>', htmlClean: '<p>Clean</p>' };
  const mockProcessedFormats: ProcessedFormats = { markdown: { ready: true, content: '# MD' } };

  // This approach requires runExportJob.ts to be refactored so these helpers are imported.
  // e.g., import * as jobHelpers from './runExportJob.helpers';
  // And then jest.mock('./runExportJob.helpers');
  // For now, we'll mock the underlying direct calls that these helpers make.

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock implementations for ExportJobService methods
    (ExportJobService.startJob as jest.Mock).mockResolvedValue(undefined);
    (ExportJobService.updateProgress as jest.Mock).mockResolvedValue(undefined);
    (ExportJobService.completeJob as jest.Mock).mockResolvedValue(undefined);
    (ExportJobService.failJob as jest.Mock).mockResolvedValue(undefined);

    // Mocks for the direct dependencies that the helper functions will call
    (firestoreAdapter.getDocument as jest.Mock).mockResolvedValue({
        id: mockDocumentId,
        workflow: mockWorkflow,
        stageStates: mockStageStates,
    });
    (generateExportHtml as jest.Mock).mockResolvedValue(mockHtmlResult);
    (processExportFormats as jest.Mock).mockResolvedValue(mockProcessedFormats);
  });

  test('should successfully process an export job', async () => {
    await runExportJob({ jobId: mockJobId, documentId: mockDocumentId, stageId: mockStageId });

    expect(ExportJobService.startJob).toHaveBeenCalledWith(mockDocumentId, mockJobId);

    // Check that fetchAndValidateExportData's underlying call was made
    expect(firestoreAdapter.getDocument).toHaveBeenCalledWith('documents', mockDocumentId);
    expect(ExportJobService.updateProgress).toHaveBeenCalledWith(mockDocumentId, mockJobId, 10);

    // Check that generateHtmlForExportStep's underlying call was made
    expect(generateExportHtml).toHaveBeenCalledWith(expect.objectContaining({
        stages: mockWorkflow.stages,
        stageStates: mockStageStates,
        exportConfig: mockValidExportConfig,
    }));
    expect(ExportJobService.updateProgress).toHaveBeenCalledWith(mockDocumentId, mockJobId, 50);

    // Check that processFormatsForExportStep's underlying call was made
    expect(processExportFormats).toHaveBeenCalledWith(mockHtmlResult.htmlStyled, mockHtmlResult.htmlClean, mockValidExportConfig);
    expect(ExportJobService.updateProgress).toHaveBeenCalledWith(mockDocumentId, mockJobId, 90);

    const expectedFinalOutput: ExportStageState['output'] = {
        htmlStyled: mockHtmlResult.htmlStyled,
        htmlClean: mockHtmlResult.htmlClean,
        markdown: mockProcessedFormats.markdown?.content,
        formats: mockProcessedFormats,
    };
    expect(ExportJobService.completeJob).toHaveBeenCalledWith(mockDocumentId, mockJobId, expectedFinalOutput);
  });

  test('should call failJob if fetchAndValidateExportData fails (e.g., document not found)', async () => {
    const fetchError = new Error(`Document ${mockDocumentId} not found.`);
    (firestoreAdapter.getDocument as jest.Mock).mockResolvedValue(null); // Simulate document not found

    await runExportJob({ jobId: mockJobId, documentId: mockDocumentId, stageId: mockStageId });

    expect(ExportJobService.startJob).toHaveBeenCalledWith(mockDocumentId, mockJobId);
    expect(ExportJobService.failJob).toHaveBeenCalledWith(mockDocumentId, mockJobId, fetchError.message, 5); // Progress at time of fail
    expect(ExportJobService.updateProgress).not.toHaveBeenCalledWith(mockDocumentId, mockJobId, 10);
    expect(ExportJobService.completeJob).not.toHaveBeenCalled();
  });

  test('should call failJob if generateHtmlForExportStep fails', async () => {
    const htmlError = new Error('HTML generation failed: Test HTML error');
    (generateExportHtml as jest.Mock).mockResolvedValue({ error: "Test HTML error" });

    await runExportJob({ jobId: mockJobId, documentId: mockDocumentId, stageId: mockStageId });

    expect(ExportJobService.startJob).toHaveBeenCalledTimes(1);
    expect(ExportJobService.updateProgress).toHaveBeenCalledWith(mockDocumentId, mockJobId, 10); // After successful fetch
    expect(ExportJobService.failJob).toHaveBeenCalledWith(mockDocumentId, mockJobId, htmlError.message, 10); // Progress at time of fail
    expect(ExportJobService.completeJob).not.toHaveBeenCalled();
  });

  test('should call failJob if processFormatsForExportStep fails', async () => {
    const formatError = new Error('Test format processing error');
    (processExportFormats as jest.Mock).mockRejectedValue(formatError);

    await runExportJob({ jobId: mockJobId, documentId: mockDocumentId, stageId: mockStageId });

    expect(ExportJobService.startJob).toHaveBeenCalledTimes(1);
    expect(ExportJobService.updateProgress).toHaveBeenCalledWith(mockDocumentId, mockJobId, 10); // After fetch
    expect(ExportJobService.updateProgress).toHaveBeenCalledWith(mockDocumentId, mockJobId, 50); // After HTML
    expect(ExportJobService.failJob).toHaveBeenCalledWith(mockDocumentId, mockJobId, formatError.message, 50); // Progress at time of fail
    expect(ExportJobService.completeJob).not.toHaveBeenCalled();
  });

  test('should call failJob if ExportJobService.startJob itself fails', async () => {
    const startJobError = new Error('Failed to start job in service');
    (ExportJobService.startJob as jest.Mock).mockRejectedValue(startJobError);
    // We need a way to catch the failJob call if startJob fails.
    // The current implementation of runExportJob will call failJob, but if failJob itself fails, it's a deeper issue.
    // This test focuses on startJob failing and runExportJob attempting to call failJob.

    await runExportJob({ jobId: mockJobId, documentId: mockDocumentId, stageId: mockStageId });

    // failJob is called by the catch block in runExportJob
    expect(ExportJobService.failJob).toHaveBeenCalledWith(mockDocumentId, mockJobId, startJobError.message, 0);
    expect(ExportJobService.completeJob).not.toHaveBeenCalled();
  });

  test('should correctly pass currentProgress to failJob on error', async () => {
    const htmlError = new Error('HTML generation error');
    (generateExportHtml as jest.Mock).mockRejectedValue(htmlError); // Simulate error during HTML generation

    await runExportJob({ jobId: mockJobId, documentId: mockDocumentId, stageId: mockStageId });

    expect(ExportJobService.failJob).toHaveBeenCalledWith(
      mockDocumentId,
      mockJobId,
      htmlError.message,
      10 // Progress after fetchAndValidate, before HTML generation attempt
    );
  });
});
