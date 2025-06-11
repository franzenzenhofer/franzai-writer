import { defineTool, tool } from 'genkit/tool';
import { z } from 'zod';

// Define a simple calculator tool
export const simpleCalculatorTool = defineTool(
  {
    name: 'simpleCalculator',
    description: 'Performs basic arithmetic operations: addition, subtraction, multiplication, division.',
    inputSchema: z.object({
      operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
      a: z.number().describe('The first operand.'),
      b: z.number().describe('The second operand.'),
    }),
    outputSchema: z.object({
      result: z.number().optional(),
      error: z.string().optional(),
    }),
  },
  async (input) => {
    console.log('[simpleCalculatorTool] Received input:', input);
    let result: number | undefined;
    let error: string | undefined;

    switch (input.operation) {
      case 'add':
        result = input.a + input.b;
        break;
      case 'subtract':
        result = input.a - input.b;
        break;
      case 'multiply':
        result = input.a * input.b;
        break;
      case 'divide':
        if (input.b === 0) {
          error = "Cannot divide by zero.";
        } else {
          result = input.a / input.b;
        }
        break;
      default:
        error = "Invalid operation.";
    }

    if (error) {
      console.error('[simpleCalculatorTool] Error:', error);
      return { error };
    }
    console.log('[simpleCalculatorTool] Result:', result);
    return { result };
  }
);

// It's good practice to also export all tools you want to make available to Genkit
export const allTools = [simpleCalculatorTool];
