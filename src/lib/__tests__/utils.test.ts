import { generateUniqueId, calculateWordCount, findLastEditedStage } from '../utils';
import type { StageState } from '@/types';

describe('generateUniqueId', () => {
  it('should generate a unique ID with correct format', () => {
    const id = generateUniqueId();
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    expect(id).toMatch(/^[a-z0-9]+w[a-z0-9]+$/);
  });

  it('should generate different IDs on subsequent calls', () => {
    const id1 = generateUniqueId();
    const id2 = generateUniqueId();
    expect(id1).not.toBe(id2);
  });

  it('should contain the "w" separator', () => {
    const id = generateUniqueId();
    expect(id).toContain('w');
  });

  it('should generate IDs with reasonable length', () => {
    const id = generateUniqueId();
    expect(id.length).toBeGreaterThan(5);
    expect(id.length).toBeLessThan(50);
  });

  it('should generate multiple unique IDs', () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
      ids.add(generateUniqueId());
    }
    expect(ids.size).toBe(100);
  });
});

describe('calculateWordCount', () => {
  it('should return 0 for empty stage states', () => {
    const result = calculateWordCount({});
    expect(result).toBe(0);
  });

  it('should count words correctly for a single stage with string output', () => {
    const stageStates: Record<string, StageState> = {
      stage1: {
        status: 'completed',
        output: 'Hello world this is a test',
        completedAt: '2023-01-01T00:00:00Z'
      }
    };
    const result = calculateWordCount(stageStates);
    expect(result).toBe(6);
  });

  it('should count words correctly for multiple stages', () => {
    const stageStates: Record<string, StageState> = {
      stage1: {
        status: 'completed',
        output: 'Hello world',
        completedAt: '2023-01-01T00:00:00Z'
      },
      stage2: {
        status: 'completed',
        output: 'This is a test',
        completedAt: '2023-01-01T01:00:00Z'
      }
    };
    const result = calculateWordCount(stageStates);
    expect(result).toBe(6);
  });

  it('should ignore stages with no output', () => {
    const stageStates: Record<string, StageState> = {
      stage1: {
        status: 'completed',
        output: 'Hello world',
        completedAt: '2023-01-01T00:00:00Z'
      },
      stage2: {
        status: 'idle'
      }
    };
    const result = calculateWordCount(stageStates);
    expect(result).toBe(2);
  });

  it('should ignore stages with non-string output', () => {
    const stageStates: Record<string, StageState> = {
      stage1: {
        status: 'completed',
        output: 'Hello world',
        completedAt: '2023-01-01T00:00:00Z'
      },
      stage2: {
        status: 'completed',
        output: { data: 'Not a string' },
        completedAt: '2023-01-01T01:00:00Z'
      },
      stage3: {
        status: 'completed',
        output: 123,
        completedAt: '2023-01-01T02:00:00Z'
      }
    };
    const result = calculateWordCount(stageStates);
    expect(result).toBe(2);
  });

  it('should handle empty strings', () => {
    const stageStates: Record<string, StageState> = {
      stage1: {
        status: 'completed',
        output: '',
        completedAt: '2023-01-01T00:00:00Z'
      }
    };
    const result = calculateWordCount(stageStates);
    expect(result).toBe(0);
  });

  it('should handle strings with only whitespace', () => {
    const stageStates: Record<string, StageState> = {
      stage1: {
        status: 'completed',
        output: '   \n\t  ',
        completedAt: '2023-01-01T00:00:00Z'
      }
    };
    const result = calculateWordCount(stageStates);
    expect(result).toBe(0);
  });

  it('should handle strings with multiple whitespace characters', () => {
    const stageStates: Record<string, StageState> = {
      stage1: {
        status: 'completed',
        output: 'Hello    world   \n\n  test',
        completedAt: '2023-01-01T00:00:00Z'
      }
    };
    const result = calculateWordCount(stageStates);
    expect(result).toBe(3);
  });

  it('should handle special characters and punctuation', () => {
    const stageStates: Record<string, StageState> = {
      stage1: {
        status: 'completed',
        output: 'Hello, world! This is a test.',
        completedAt: '2023-01-01T00:00:00Z'
      }
    };
    const result = calculateWordCount(stageStates);
    expect(result).toBe(6);
  });

  it('should handle very long text', () => {
    const longText = 'word '.repeat(1000).trim();
    const stageStates: Record<string, StageState> = {
      stage1: {
        status: 'completed',
        output: longText,
        completedAt: '2023-01-01T00:00:00Z'
      }
    };
    const result = calculateWordCount(stageStates);
    expect(result).toBe(1000);
  });
});

describe('findLastEditedStage', () => {
  it('should return undefined for empty stage states', () => {
    const result = findLastEditedStage({});
    expect(result).toBeUndefined();
  });

  it('should return undefined when no stages have completedAt', () => {
    const stageStates: Record<string, StageState> = {
      stage1: {
        status: 'idle'
      },
      stage2: {
        status: 'running'
      }
    };
    const result = findLastEditedStage(stageStates);
    expect(result).toBeUndefined();
  });

  it('should return the only stage with completedAt', () => {
    const stageStates: Record<string, StageState> = {
      stage1: {
        status: 'completed',
        completedAt: '2023-01-01T00:00:00Z'
      },
      stage2: {
        status: 'idle'
      }
    };
    const result = findLastEditedStage(stageStates);
    expect(result).toBe('stage1');
  });

  it('should return the most recently completed stage', () => {
    const stageStates: Record<string, StageState> = {
      stage1: {
        status: 'completed',
        completedAt: '2023-01-01T00:00:00Z'
      },
      stage2: {
        status: 'completed',
        completedAt: '2023-01-01T02:00:00Z'
      },
      stage3: {
        status: 'completed',
        completedAt: '2023-01-01T01:00:00Z'
      }
    };
    const result = findLastEditedStage(stageStates);
    expect(result).toBe('stage2');
  });

  it('should handle different date formats', () => {
    const stageStates: Record<string, StageState> = {
      stage1: {
        status: 'completed',
        completedAt: '2023-01-01T00:00:00.000Z'
      },
      stage2: {
        status: 'completed',
        completedAt: '2023-01-01T00:00:01Z'
      }
    };
    const result = findLastEditedStage(stageStates);
    expect(result).toBe('stage2');
  });

  it('should handle stages with same completion time', () => {
    const sameTime = '2023-01-01T00:00:00Z';
    const stageStates: Record<string, StageState> = {
      stage1: {
        status: 'completed',
        completedAt: sameTime
      },
      stage2: {
        status: 'completed',
        completedAt: sameTime
      }
    };
    const result = findLastEditedStage(stageStates);
    expect(['stage1', 'stage2']).toContain(result);
  });

  it('should ignore stages with invalid completedAt dates', () => {
    const stageStates: Record<string, StageState> = {
      stage1: {
        status: 'completed',
        completedAt: 'invalid-date'
      },
      stage2: {
        status: 'completed',
        completedAt: '2023-01-01T00:00:00Z'
      }
    };
    const result = findLastEditedStage(stageStates);
    expect(result).toBe('stage2');
  });

  it('should handle mixed valid and invalid dates', () => {
    const stageStates: Record<string, StageState> = {
      stage1: {
        status: 'completed',
        completedAt: '2023-01-01T00:00:00Z'
      },
      stage2: {
        status: 'completed',
        completedAt: 'invalid-date'
      },
      stage3: {
        status: 'completed',
        completedAt: '2023-01-01T01:00:00Z'
      }
    };
    const result = findLastEditedStage(stageStates);
    expect(result).toBe('stage3');
  });

  it('should handle stages with different statuses', () => {
    const stageStates: Record<string, StageState> = {
      stage1: {
        status: 'error',
        completedAt: '2023-01-01T00:00:00Z'
      },
      stage2: {
        status: 'completed',
        completedAt: '2023-01-01T02:00:00Z'
      },
      stage3: {
        status: 'running',
        completedAt: '2023-01-01T01:00:00Z'
      }
    };
    const result = findLastEditedStage(stageStates);
    expect(result).toBe('stage2');
  });

  it('should handle future dates', () => {
    const futureDate = new Date(Date.now() + 1000000).toISOString();
    const pastDate = '2023-01-01T00:00:00Z';
    const stageStates: Record<string, StageState> = {
      stage1: {
        status: 'completed',
        completedAt: pastDate
      },
      stage2: {
        status: 'completed',
        completedAt: futureDate
      }
    };
    const result = findLastEditedStage(stageStates);
    expect(result).toBe('stage2');
  });
});