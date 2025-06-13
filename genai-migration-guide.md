# Migration Guide: @google/generative-ai to @google/genai

## Package Names and Main Classes

### Old: @google/generative-ai
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI('API_KEY');
```

### New: @google/genai
```typescript
import { GoogleGenAI } from '@google/genai';
const genAI = new GoogleGenAI({ apiKey: 'API_KEY' });
```

## Key Export Differences

### @google/generative-ai exports:
- `GoogleGenerativeAI` (main class)
- `GenerativeModel`
- `ChatSession`
- `SchemaType`
- `FunctionCallingMode`
- `HarmCategory`, `HarmBlockThreshold`
- Error classes: `GoogleGenerativeAIError`, `GoogleGenerativeAIFetchError`, etc.

### @google/genai exports:
- `GoogleGenAI` (main class)
- `Chat`, `Chats` (replaces ChatSession)
- `Models`, `Files`, `Caches` (new resource managers)
- `GenerateContentResponse`, `EmbedContentResponse` (response classes)
- `FunctionCallingConfigMode` (replaces FunctionCallingMode)
- Additional features: `Live`, `Operations`, `Tokens`

## Common Migration Patterns

### 1. Initialization
```typescript
// Old
const genAI = new GoogleGenerativeAI('API_KEY');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// New
const genAI = new GoogleGenAI({ apiKey: 'API_KEY' });
const model = genAI.models.get('gemini-2.0-flash-exp');
```

### 2. Generate Content
```typescript
// Old
const result = await model.generateContent('Hello');
const response = await result.response;
const text = response.text();

// New
const response = await model.generateContent({ content: 'Hello' });
const text = response.text();
```

### 3. Chat Sessions
```typescript
// Old
const chat = model.startChat();
const result = await chat.sendMessage('Hello');

// New
const chat = genAI.chats.create({ model: 'gemini-2.0-flash-exp' });
const response = await chat.send('Hello');
```

### 4. Function Calling
```typescript
// Old
import { FunctionCallingMode } from '@google/generative-ai';

// New
import { FunctionCallingConfigMode } from '@google/genai';
```

### 5. Schema Types
```typescript
// Old
import { SchemaType } from '@google/generative-ai';
SchemaType.STRING

// New
import { Type } from '@google/genai';
Type.STRING
```

## New Features in @google/genai

1. **Vertex AI Support**: Can connect to Vertex AI with project/location
2. **Live API**: Real-time streaming capabilities
3. **Files API**: Built-in file management
4. **Caching**: Content caching support
5. **Operations**: Async operation management
6. **Enhanced Models**: Better model management with Models class

## Import Mapping

| @google/generative-ai | @google/genai |
|----------------------|---------------|
| GoogleGenerativeAI | GoogleGenAI |
| GenerativeModel | (use genAI.models.get()) |
| ChatSession | Chat |
| SchemaType | Type |
| FunctionCallingMode | FunctionCallingConfigMode |
| GoogleGenerativeAIError | (various specific error types) |

## Server-side Usage

Both packages support server-side usage:
- `@google/generative-ai/server` 
- `@google/genai/node`