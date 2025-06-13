import { z } from 'zod';

// Tool definitions without using ai.defineTool
// These will be converted to proper tools when needed

export const simpleCalculatorDefinition = {
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
  fn: async (input: any) => {
    console.log('[simpleCalculator] Received input:', input);
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
      console.error('[simpleCalculator] Error:', error);
      return { error };
    }
    console.log('[simpleCalculator] Result:', result);
    return { result };
  }
};

export const weatherToolDefinition = {
  name: 'weatherTool',
  description: 'Get current weather information for a location (demo data for testing).',
  inputSchema: z.object({
    location: z.string().describe('The location to get weather for.'),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    conditions: z.string(),
    humidity: z.number(),
    windSpeed: z.number(),
    unit: z.string(),
  }),
  fn: async (input: any) => {
    console.log('[weatherTool] Getting weather for:', input.location);
    
    // Demo weather data
    const weatherData: Record<string, any> = {
      'new york': { temperature: 72, conditions: 'Partly Cloudy', humidity: 65, windSpeed: 10 },
      'london': { temperature: 59, conditions: 'Rainy', humidity: 80, windSpeed: 15 },
      'tokyo': { temperature: 77, conditions: 'Sunny', humidity: 55, windSpeed: 5 },
      'paris': { temperature: 68, conditions: 'Cloudy', humidity: 70, windSpeed: 12 },
      'sydney': { temperature: 82, conditions: 'Clear', humidity: 45, windSpeed: 8 },
    };
    
    const normalizedLocation = input.location.toLowerCase();
    const data = weatherData[normalizedLocation] || {
      temperature: 70,
      conditions: 'Clear',
      humidity: 50,
      windSpeed: 7
    };
    
    return {
      ...data,
      unit: 'Fahrenheit'
    };
  }
};

export const unitConverterDefinition = {
  name: 'unitConverter',
  description: 'Convert between different units of measurement.',
  inputSchema: z.object({
    value: z.number().describe('The value to convert.'),
    fromUnit: z.string().describe('The unit to convert from.'),
    toUnit: z.string().describe('The unit to convert to.'),
  }),
  outputSchema: z.object({
    result: z.number().optional(),
    error: z.string().optional(),
  }),
  fn: async (input: any) => {
    console.log('[unitConverter] Converting:', input);
    
    const conversions: Record<string, Record<string, number | ((x: number) => number)>> = {
      // Length
      'meter': { 'feet': 3.28084, 'kilometer': 0.001, 'mile': 0.000621371 },
      'kilometer': { 'mile': 0.621371, 'meter': 1000, 'feet': 3280.84 },
      'mile': { 'kilometer': 1.60934, 'meter': 1609.34, 'feet': 5280 },
      'feet': { 'meter': 0.3048, 'kilometer': 0.0003048, 'mile': 0.000189394 },
      
      // Temperature
      'celsius': { 'fahrenheit': (c: number) => (c * 9/5) + 32, 'kelvin': (c: number) => c + 273.15 },
      'fahrenheit': { 'celsius': (f: number) => (f - 32) * 5/9, 'kelvin': (f: number) => (f - 32) * 5/9 + 273.15 },
      'kelvin': { 'celsius': (k: number) => k - 273.15, 'fahrenheit': (k: number) => (k - 273.15) * 9/5 + 32 },
    };
    
    const fromUnit = input.fromUnit.toLowerCase();
    const toUnit = input.toUnit.toLowerCase();
    
    // Direct conversion
    if (conversions[fromUnit]?.[toUnit]) {
      const converter = conversions[fromUnit][toUnit];
      const result = typeof converter === 'function' ? converter(input.value) : input.value * converter;
      return { result: Math.round(result * 100) / 100 };
    }
    
    // Reverse conversion
    if (conversions[toUnit]?.[fromUnit]) {
      const converter = conversions[toUnit][fromUnit];
      const result = typeof converter === 'function' ? 
        input.value : // Can't reverse functions easily
        input.value / converter;
      return { result: Math.round(result * 100) / 100 };
    }
    
    return { error: `Cannot convert from ${input.fromUnit} to ${input.toUnit}` };
  }
};

// Export all tool definitions
export const toolDefinitions = [
  simpleCalculatorDefinition,
  weatherToolDefinition,
  unitConverterDefinition
];