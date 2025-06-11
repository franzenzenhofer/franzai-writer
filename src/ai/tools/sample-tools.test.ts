import { simpleCalculatorTool } from './sample-tools';

describe('simpleCalculatorTool', () => {
  it('should add two numbers', async () => {
    const result = await simpleCalculatorTool.fn({ operation: 'add', a: 5, b: 3 });
    expect(result).toEqual({ result: 8 });
  });

  it('should subtract two numbers', async () => {
    const result = await simpleCalculatorTool.fn({ operation: 'subtract', a: 5, b: 3 });
    expect(result).toEqual({ result: 2 });
  });

  it('should multiply two numbers', async () => {
    const result = await simpleCalculatorTool.fn({ operation: 'multiply', a: 5, b: 3 });
    expect(result).toEqual({ result: 15 });
  });

  it('should divide two numbers', async () => {
    const result = await simpleCalculatorTool.fn({ operation: 'divide', a: 6, b: 3 });
    expect(result).toEqual({ result: 2 });
  });

  it('should handle division by zero', async () => {
    const result = await simpleCalculatorTool.fn({ operation: 'divide', a: 5, b: 0 });
    expect(result).toEqual({ error: "Cannot divide by zero." });
  });

  it('should handle invalid operation', async () => {
    // @ts-expect-error Testing invalid operation
    const result = await simpleCalculatorTool.fn({ operation: 'modulo', a: 5, b: 3 });
    expect(result).toEqual({ error: "Invalid operation." });
  });

  // Test schema definitions (optional, but good for completeness)
  it('should have correct name and description', () => {
    expect(simpleCalculatorTool.name).toBe('simpleCalculator');
    expect(simpleCalculatorTool.description).toBe('Performs basic arithmetic operations: addition, subtraction, multiplication, division.');
  });
});
