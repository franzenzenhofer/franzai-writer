import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StageInputArea, type StageInputAreaProps } from './stage-input-area';
import type { Stage, StageState } from '@/types';

// Mock child components
jest.mock('./smart-dropzone', () => ({
  SmartDropzone: jest.fn(() => <div data-testid="smart-dropzone">SmartDropzone</div>),
}));
jest.mock('./token-counter', () => ({
  TokenCounter: jest.fn(() => <div data-testid="token-counter">TokenCounter</div>),
}));

const mockOnInputChange = jest.fn();
const mockOnFormSubmit = jest.fn();

const defaultStageProps: Stage = {
  id: 'test-stage',
  title: 'Test Stage',
  description: 'Test Description',
  inputType: 'textarea', // Default, will be overridden in tests
  outputType: 'text',
  dependencies: [],
  autoRun: false,
};

const defaultStageState: StageState = {
  id: 'test-stage',
  status: 'pending',
  userInput: null,
  output: null,
  error: null,
  isLoading: false,
};

const renderComponent = (props: Partial<StageInputAreaProps> = {}) => {
  const combinedProps: StageInputAreaProps = {
    stage: defaultStageProps,
    stageState: defaultStageState,
    onInputChange: mockOnInputChange,
    onFormSubmit: mockOnFormSubmit,
    allStageStates: {},
    ...props,
  };
  return render(<StageInputArea {...combinedProps} ref={React.createRef()} />);
};

describe('StageInputArea', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Image Input Type', () => {
    const imageStage: Stage = {
      ...defaultStageProps,
      id: 'image-stage',
      inputType: 'image',
    };

    it('renders file input when inputType is image', () => {
      renderComponent({ stage: imageStage });
      expect(screen.getByLabelText(/Upload Image/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Upload Image/i)).toHaveAttribute('type', 'file');
      expect(screen.getByLabelText(/Upload Image/i)).toHaveAttribute('accept', 'image/*');
    });

    it('calls onInputChange with image data and shows preview when a file is selected', async () => {
      // Mock FileReader
      const mockFileReader = {
        onloadend: jest.fn(),
        readAsDataURL: jest.fn(),
        result: 'data:image/png;base64,test-base64-string',
      };
      jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      renderComponent({ stage: imageStage });

      const fileInput = screen.getByLabelText(/Upload Image/i);
      const testFile = new File(['dummy content'], 'test.png', { type: 'image/png' });

      fireEvent.change(fileInput, { target: { files: [testFile] } });

      // Simulate FileReader onloadend
      if (mockFileReader.onloadend) {
        mockFileReader.onloadend();
      }

      await waitFor(() => {
        expect(mockOnInputChange).toHaveBeenCalledWith(imageStage.id, 'userInput', {
          fileName: 'test.png',
          mimeType: 'image/png',
          data: 'test-base64-string',
          imageUrl: 'data:image/png;base64,test-base64-string',
        });
      });

      // Check for preview
      const previewImage = screen.getByAltText('Selected preview') as HTMLImageElement;
      expect(previewImage).toBeInTheDocument();
      expect(previewImage.src).toBe('data:image/png;base64,test-base64-string');

      // Restore FileReader
      jest.restoreAllMocks();
    });

    it('clears image preview and data when file input is cleared', async () => {
      // Initial setup with an image selected
      const mockFileReader = {
        onloadend: jest.fn(),
        readAsDataURL: jest.fn((_file) => {
          // Directly call onloadend if it's set, simulating async read
          if (mockFileReader.onloadend) {
            mockFileReader.onloadend();
          }
        }),
        result: 'data:image/jpeg;base64,initial-base64-data',
      };
      const fileReaderSpy = jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      renderComponent({
        stage: imageStage,
        stageState: {
          ...defaultStageState,
          userInput: {
            imageUrl: 'data:image/jpeg;base64,initial-base64-data'
          }
        }
      });

      let previewImage = screen.getByAltText('Selected preview') as HTMLImageElement;
      expect(previewImage).toBeInTheDocument();
      expect(previewImage.src).toContain('initial-base64-data');

      // Simulate clearing the file input
      const fileInput = screen.getByLabelText(/Upload Image/i);
      fireEvent.change(fileInput, { target: { files: null } });

      await waitFor(() => {
        expect(mockOnInputChange).toHaveBeenCalledWith(imageStage.id, 'userInput', null);
      });

      // Preview should be gone
      expect(screen.queryByAltText('Selected preview')).not.toBeInTheDocument();

      fileReaderSpy.mockRestore();
    });

    it('re-renders preview if stageState.userInput.imageUrl is already populated', () => {
      const initialImageUrl = 'data:image/gif;base64,existing-image-data';
      renderComponent({
        stage: imageStage,
        stageState: {
          ...defaultStageState,
          userInput: {
            imageUrl: initialImageUrl,
            // other fields like fileName, mimeType, data would also be here in a real scenario
          }
        }
      });

      const previewImage = screen.getByAltText('Selected preview') as HTMLImageElement;
      expect(previewImage).toBeInTheDocument();
      expect(previewImage.src).toBe(initialImageUrl);
    });
  });

  describe('Document Input Type', () => {
    const documentStage: Stage = {
      ...defaultStageProps,
      id: 'doc-stage',
      inputType: 'document',
    };

    let fileReaderSpy: jest.SpyInstance;
    let mockFileReader: {
        onloadend: jest.FunctionLike | null;
        onload: jest.FunctionLike | null;
        readAsDataURL: jest.Mock<any, any, any>;
        readAsText: jest.Mock<any, any, any>;
        result: string | ArrayBuffer | null;
        error: jest.Mock<any, any, any>;
    };


    beforeEach(() => {
        mockFileReader = {
            onloadend: null, // Will be set by the component
            onload: null, // Will be set by the component for readAsText
            readAsDataURL: jest.fn(),
            readAsText: jest.fn(),
            result: null,
            error: jest.fn(),
        };
        fileReaderSpy = jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);
    });

    afterEach(() => {
        fileReaderSpy.mockRestore();
    });

    it('renders file input when inputType is document', () => {
      renderComponent({ stage: documentStage });
      const fileInput = screen.getByLabelText(/Upload Document/i);
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('type', 'file');
      expect(fileInput).toHaveAttribute('accept', '.pdf,.doc,.docx,.txt,.md');
    });

    it('calls onInputChange with document metadata and content for .txt file and shows info', async () => {
      renderComponent({ stage: documentStage });
      const fileInput = screen.getByLabelText(/Upload Document/i);
      const testFile = new File(['Hello World'], 'test.txt', { type: 'text/plain' });
      const testContent = 'Hello World';
      mockFileReader.result = testContent;

      fireEvent.change(fileInput, { target: { files: [testFile] } });

      // Simulate readAsText onload
      if (typeof mockFileReader.onload === 'function') {
        mockFileReader.onload({ target: { result: testContent } } as ProgressEvent<FileReader>);
      }

      await waitFor(() => {
        expect(mockOnInputChange).toHaveBeenCalledWith(documentStage.id, 'userInput', {
          documentName: 'test.txt',
          documentType: 'text/plain',
          documentSize: testFile.size,
          fileContent: testContent,
        });
      });

      expect(screen.getByText(`File: test.txt (text/plain, ${testFile.size} bytes)`)).toBeInTheDocument();
    });

    it('calls fetch to /api/files/upload for non-txt file and updates state on success', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          fileUri: 'files/mock-uri-123',
          fileName: 'test.pdf',
          mimeType: 'application/pdf',
        }),
      } as Response);

      renderComponent({ stage: documentStage });
      const fileInput = screen.getByLabelText(/Upload Document/i);
      const testFile = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' });

      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [testFile] } });
        // Allow promises from async handler to resolve
        await new Promise(resolve => setImmediate(resolve));
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/files/upload', expect.any(Object));
      expect(mockOnInputChange).toHaveBeenCalledWith(documentStage.id, 'userInput', {
        documentName: 'test.pdf',
        documentType: 'application/pdf',
        fileUri: 'files/mock-uri-123',
        documentSize: testFile.size,
        fileContent: null,
      });
      expect(screen.getByText('Uploaded: test.pdf (URI: files/mock-uri-123)')).toBeInTheDocument();
      expect(screen.getByText('Upload successful!')).toBeInTheDocument(); // Progress message
    });

    it('handles fetch error during file upload for non-txt file', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server upload error' }),
      } as Response);

      renderComponent({ stage: documentStage });
      const fileInput = screen.getByLabelText(/Upload Document/i);
      const testFile = new File(['excel content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [testFile] } });
        await new Promise(resolve => setImmediate(resolve));
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/files/upload', expect.any(Object));
      expect(mockOnInputChange).toHaveBeenCalledWith(documentStage.id, 'userInput', {
        documentName: 'test.xlsx',
        documentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        documentSize: testFile.size,
        fileUri: null,
        fileContent: null,
        uploadError: 'Server upload error',
      });
      expect(screen.getByText('Upload failed for test.xlsx: Server upload error')).toBeInTheDocument();
      expect(screen.getByText('Upload failed: Server upload error')).toBeInTheDocument(); // Progress message
    });


    it('clears document info when file input is cleared', async () => {
      renderComponent({ stage: documentStage });
      const fileInput = screen.getByLabelText(/Upload Document/i);
      const testFile = new File(['dummy'], 'test.txt', { type: 'text/plain' });

      // Select a file first
      fireEvent.change(fileInput, { target: { files: [testFile] } });
      await waitFor(() => {
        expect(screen.getByText(`File: test.txt (text/plain, ${testFile.size} bytes)`)).toBeInTheDocument();
      });

      // Clear the file input
      fireEvent.change(fileInput, { target: { files: null } });
      await waitFor(() => {
        expect(mockOnInputChange).toHaveBeenCalledWith(documentStage.id, 'userInput', null);
      });
      expect(screen.queryByText(`File: test.txt (text/plain, ${testFile.size} bytes)`)).not.toBeInTheDocument();
    });

    it('re-renders document info if stageState.userInput.documentName is already populated', () => {
      const initialDocInfo = {
        documentName: 'old-doc.pdf',
        documentType: 'application/pdf',
        documentSize: 12345,
      };
      renderComponent({
        stage: documentStage,
        stageState: {
          ...defaultStageState,
          userInput: initialDocInfo
        }
      });
      expect(screen.getByText(`File: old-doc.pdf (application/pdf, 12345 bytes)`)).toBeInTheDocument();
    });
  });

  describe('Chat Enabled Input Area', () => {
    const chatStage: Stage = {
      ...defaultStageProps,
      id: 'chat-input-stage',
      inputType: 'textarea',
      chatEnabled: true,
      description: "Enter chat message"
    };

    it('renders textarea with fewer rows and different placeholder if chatEnabled', () => {
      renderComponent({
          stage: chatStage,
          stageState: {...defaultStageState, stageId: chatStage.id }
      });
      const textarea = screen.getByPlaceholderText('Enter chat message'); // Placeholder comes from stage.description
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('rows', '3');
    });
  });

  // TODO: Add tests for other input types (textarea, form, context, none)
  // to ensure existing functionality is not broken.
});
