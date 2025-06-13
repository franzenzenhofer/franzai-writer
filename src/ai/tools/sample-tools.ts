import { z } from 'zod';
import { ai } from '../genkit';

// Define a simple calculator tool
export const simpleCalculatorTool = ai.defineTool(
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

// Weather tool - returns demo data for testing
export const weatherTool = ai.defineTool(
  {
    name: 'weatherTool',
    description: 'Get current weather information for a location (demo data for testing)',
    inputSchema: z.object({
      location: z.string().describe('The location to get weather for'),
    }),
    outputSchema: z.object({
      location: z.string(),
      temperature: z.number(),
      conditions: z.string(),
      humidity: z.number(),
      windSpeed: z.number(),
    }),
  },
  async (input) => {
    console.log('[weatherTool] Getting weather for:', input.location);
    // Return demo data - in production this would call a weather API
    const demoWeather = {
      'New York': { temperature: 72, conditions: 'Partly cloudy', humidity: 65, windSpeed: 10 },
      'London': { temperature: 59, conditions: 'Rainy', humidity: 80, windSpeed: 15 },
      'Tokyo': { temperature: 68, conditions: 'Clear', humidity: 55, windSpeed: 5 },
      'default': { temperature: 70, conditions: 'Sunny', humidity: 50, windSpeed: 8 },
    };
    
    const weather = demoWeather[input.location as keyof typeof demoWeather] || demoWeather['default'];
    return {
      location: input.location,
      ...weather,
    };
  }
);

// Unit converter tool
export const unitConverter = ai.defineTool(
  {
    name: 'unitConverter',
    description: 'Convert between different units of measurement',
    inputSchema: z.object({
      value: z.number().describe('The value to convert'),
      fromUnit: z.string().describe('The unit to convert from'),
      toUnit: z.string().describe('The unit to convert to'),
    }),
    outputSchema: z.object({
      originalValue: z.number(),
      originalUnit: z.string(),
      convertedValue: z.number(),
      convertedUnit: z.string(),
      error: z.string().optional(),
    }),
  },
  async (input) => {
    console.log('[unitConverter] Converting:', input);
    
    // Simple conversion logic - in production this would be more comprehensive
    const conversions: Record<string, number> = {
      // Length
      'kilometers:miles': 0.621371,
      'miles:kilometers': 1.60934,
      'meters:feet': 3.28084,
      'feet:meters': 0.3048,
      
      // Temperature (special handling needed)
      'celsius:fahrenheit': 0, // Special case
      'fahrenheit:celsius': 0, // Special case
      
      // Weight
      'kilograms:pounds': 2.20462,
      'pounds:kilograms': 0.453592,
    };
    
    const conversionKey = `${input.fromUnit.toLowerCase()}:${input.toUnit.toLowerCase()}`;
    let convertedValue: number;
    
    // Handle temperature conversions specially
    if (conversionKey === 'celsius:fahrenheit') {
      convertedValue = (input.value * 9/5) + 32;
    } else if (conversionKey === 'fahrenheit:celsius') {
      convertedValue = (input.value - 32) * 5/9;
    } else if (conversions[conversionKey]) {
      convertedValue = input.value * conversions[conversionKey];
    } else {
      return {
        originalValue: input.value,
        originalUnit: input.fromUnit,
        convertedValue: 0,
        convertedUnit: input.toUnit,
        error: `Conversion from ${input.fromUnit} to ${input.toUnit} not supported`,
      };
    }
    
    return {
      originalValue: input.value,
      originalUnit: input.fromUnit,
      convertedValue: Math.round(convertedValue * 100) / 100, // Round to 2 decimal places
      convertedUnit: input.toUnit,
    };
  }
);

// It's good practice to also export all tools you want to make available to Genkit
export const allTools = [simpleCalculatorTool, weatherTool, unitConverter];
