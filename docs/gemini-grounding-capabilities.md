# Gemini Grounding Capabilities (Google Search & URL Access)

This document provides a comprehensive overview of grounding capabilities across different Gemini models as of June 2025.

## Overview

Grounding allows Gemini models to access external information sources to provide more accurate, up-to-date, and factual responses. There are two main types of grounding:

1. **Google Search Grounding** - Access to real-time web search results
2. **URL Context** - Direct access to specific web pages or documents

## Model Support Matrix

### Google Search Grounding Support

| Model | Google Search Support | Implementation Method | Notes |
|-------|----------------------|----------------------|-------|
| **Gemini 2.5 Pro** | ✅ YES | Search as Tool | Latest capability |
| **Gemini 2.5 Flash** | ✅ YES | Search as Tool | Explicitly documented |
| **Gemini 2.0 Flash** | ✅ YES | Search as Tool | Full support |
| **Gemini 2.0 Flash-Lite** | ❌ NO | N/A | No function calling support |
| **Gemini 1.5 Pro** | ✅ YES | Dynamic Retrieval | Legacy approach |
| **Gemini 1.5 Flash** | ✅ YES | Dynamic Retrieval | Legacy approach |

### URL Context Access

| Model | URL Access | Method | Notes |
|-------|-----------|--------|-------|
| **Gemini 2.5 Pro** | ✅ YES | URL Context Tool | Can process web pages |
| **Gemini 2.5 Flash** | ✅ YES | URL Context Tool | Can process web pages |
| **Gemini 2.0 Flash** | ✅ YES | URL Context Tool | Can process web pages |
| **Gemini 2.0 Flash-Lite** | ❌ NO | N/A | Limited capabilities |
| **Gemini 1.5 Pro** | ✅ YES | URL Context Tool | Can process web pages |
| **Gemini 1.5 Flash** | ✅ YES | URL Context Tool | Can process web pages |

## Implementation Details with Example Calls

### 1. Google Search Grounding (Gemini 2.0+)

For Gemini 2.0 and newer models, Google Search is implemented as a tool that the model can choose to use:

#### Python SDK Examples

```python
# Basic Google Search Grounding
from google.generativeai import GenerativeModel, GenerateContentConfig, Tool, GoogleSearch

model = GenerativeModel("gemini-2.5-flash")

# Example 1: Current Events Query
response = model.generate_content(
    "What are the latest developments in quantum computing as of June 2025?",
    generation_config=GenerateContentConfig(
        tools=[Tool(google_search=GoogleSearch())],
        temperature=0.0
    )
)
print(response.text)

# Example 2: Company Information
response = model.generate_content(
    "What are the current stock prices for Apple, Google, and Microsoft?",
    generation_config=GenerateContentConfig(
        tools=[Tool(google_search=GoogleSearch())],
        temperature=0.0
    )
)

# Example 3: Weather Query
response = model.generate_content(
    "What's the weather forecast for San Francisco this week?",
    generation_config=GenerateContentConfig(
        tools=[Tool(google_search=GoogleSearch())],
        temperature=0.0
    )
)
```

#### REST API Examples

```bash
# Example 1: News Query with Google Search
curl -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$API_KEY \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "role": "user",
      "parts": [{
        "text": "What are the latest AI announcements from major tech companies this week?"
      }]
    }],
    "tools": [{
      "googleSearch": {}
    }],
    "generationConfig": {
      "temperature": 0.0
    }
  }'

# Example 2: Research Query
curl -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$API_KEY \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "role": "user",
      "parts": [{
        "text": "Find recent scientific papers about CRISPR gene editing published in 2025"
      }]
    }],
    "tools": [{
      "googleSearch": {}
    }],
    "generationConfig": {
      "temperature": 0.0
    }
  }'
```

#### JavaScript/TypeScript Examples

```typescript
// Using Google AI SDK
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  tools: [{
    googleSearch: {}
  }]
});

// Example 1: Real-time Information
async function getCurrentInfo() {
  const result = await model.generateContent({
    contents: [{
      role: "user",
      parts: [{
        text: "What are the current gas prices in California?"
      }]
    }],
    generationConfig: {
      temperature: 0.0
    }
  });
  
  console.log(result.response.text());
}

// Example 2: Fact Checking
async function factCheck() {
  const result = await model.generateContent({
    contents: [{
      role: "user",
      parts: [{
        text: "Verify this claim: The James Webb telescope discovered water on an exoplanet in 2025"
      }]
    }],
    generationConfig: {
      temperature: 0.0
    }
  });
  
  return result.response.text();
}
```

### 2. Dynamic Retrieval (Gemini 1.5) - Legacy Method

For Gemini 1.5 models, grounding uses "dynamic retrieval" with a threshold:

```python
# Python SDK Examples for Gemini 1.5
from google.generativeai import GenerativeModel

model = GenerativeModel("gemini-1.5-pro")

# Example 1: Always Search (threshold = 0.0)
response = model.generate_content(
    "What is the current population of Tokyo?",
    generation_config={
        "dynamicRetrieval": {
            "threshold": 0.0  # Always search
        }
    }
)

# Example 2: Search When Needed (default)
response = model.generate_content(
    "Explain the latest breakthrough in renewable energy",
    generation_config={
        "dynamicRetrieval": {
            "threshold": 0.3  # Default - search when confidence is low
        }
    }
)

# Example 3: Minimal Search (threshold = 0.8)
response = model.generate_content(
    "What are the main causes of climate change?",
    generation_config={
        "dynamicRetrieval": {
            "threshold": 0.8  # Only search if very uncertain
        }
    }
)
```

### 3. URL Context Access Examples

URL context allows models to access and analyze specific web pages:

```python
# Python Examples
import google.generativeai as genai

genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

# Example 1: Summarize Article
response = model.generate_content([
    "Please summarize the main points from this article:",
    "https://blog.google/technology/ai/google-gemini-ai/#sundar-note"
])

# Example 2: Extract Information
response = model.generate_content([
    "Extract all the pricing information from this page:",
    "https://ai.google.dev/pricing"
])

# Example 3: Compare Multiple URLs
response = model.generate_content([
    "Compare the features described in these two pages:",
    "https://ai.google.dev/gemini-api/docs/models/gemini",
    "https://platform.openai.com/docs/models"
])
```

```javascript
// JavaScript Examples
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Example 1: Analyze Documentation
async function analyzeDoc() {
  const result = await model.generateContent([
    "What are the key features mentioned in this documentation?",
    "https://firebase.google.com/docs/firestore"
  ]);
  return result.response.text();
}

// Example 2: Extract Code Examples
async function extractCode() {
  const result = await model.generateContent([
    "Extract all Python code examples from this tutorial:",
    "https://developers.google.com/machine-learning/crash-course"
  ]);
  return result.response.text();
}
```

### 4. Combined Grounding Examples (Search + URL)

```python
# Combining Google Search with URL context
model = GenerativeModel("gemini-2.5-pro")

# Example: Research and Compare
response = model.generate_content(
    """
    1. Search for recent reviews of the Tesla Model 3
    2. Compare them with the official specs at: https://www.tesla.com/model3
    3. Provide a balanced analysis
    """,
    generation_config=GenerateContentConfig(
        tools=[Tool(google_search=GoogleSearch())],
        temperature=0.0
    )
)

# Example: Fact-check Article
response = model.generate_content(
    """
    Fact-check the claims in this article: https://example.com/climate-article
    Use current scientific data from Google Search to verify.
    """,
    generation_config=GenerateContentConfig(
        tools=[Tool(google_search=GoogleSearch())],
        temperature=0.0
    )
)
```

### 5. Genkit Integration Examples

```typescript
// src/ai/flows/grounded-generation.ts
import { defineFlow } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/googleai';

// Flow with Google Search Grounding
export const groundedSearchFlow = defineFlow(
  {
    name: 'groundedSearch',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (query) => {
    const response = await generate({
      model: googleAI('gemini-2.5-flash'),
      prompt: query,
      tools: [{
        googleSearch: {}
      }],
      config: {
        temperature: 0.0
      }
    });
    return response.text();
  }
);

// Flow with URL Analysis
export const urlAnalysisFlow = defineFlow(
  {
    name: 'urlAnalysis',
    inputSchema: z.object({
      prompt: z.string(),
      url: z.string()
    }),
    outputSchema: z.string(),
  },
  async ({ prompt, url }) => {
    const response = await generate({
      model: googleAI('gemini-2.0-flash'),
      prompt: `${prompt}\n\nAnalyze this URL: ${url}`,
      config: {
        temperature: 0.0
      }
    });
    return response.text();
  }
);
```

### 6. Error Handling Examples

```python
# Python Error Handling
try:
    response = model.generate_content(
        "What's happening in the stock market today?",
        generation_config=GenerateContentConfig(
            tools=[Tool(google_search=GoogleSearch())],
            temperature=0.0
        )
    )
except Exception as e:
    if "quota" in str(e).lower():
        print("Grounding quota exceeded. Falling back to non-grounded response.")
        response = model.generate_content(
            "Provide general information about stock market trends",
            generation_config=GenerateContentConfig(temperature=0.7)
        )
    else:
        raise e
```

```javascript
// JavaScript Error Handling
async function safeGroundedQuery(query) {
  try {
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: query }]
      }],
      tools: [{ googleSearch: {} }],
      generationConfig: { temperature: 0.0 }
    });
    return result.response.text();
  } catch (error) {
    if (error.message.includes('429')) {
      console.log('Rate limit reached, waiting before retry...');
      await new Promise(resolve => setTimeout(resolve, 60000));
      return safeGroundedQuery(query);
    }
    throw error;
  }
}
```

## API Parameters and Configuration

### For Google Search (Gemini 2.0+)
- **Tool Declaration**: `{"googleSearch": {}}`
- **Temperature**: Recommended 0.0 for best results
- **Model Decision**: The model decides when to use search

### For Dynamic Retrieval (Gemini 1.5)
- **Threshold**: 0.0 to 1.0 (default 0.3)
  - Lower values = more frequent searches
  - Higher values = searches only when necessary
- **Force Search**: Set threshold to 0.0 to always search

## Limitations and Requirements

### Rate Limits
- **Google Search**: 1 million queries per day
- **Higher Limits**: Contact Google Cloud support

### Content Restrictions
- Web pages that disallow Google-Extended are not used
- Grounded URIs are accessible for 30 days
- URIs cannot be queried programmatically

### Best Practices
1. Use temperature 0.0 for grounding tasks
2. Be specific in prompts to trigger appropriate searches
3. Monitor usage to stay within rate limits
4. For time-sensitive information, always use grounding

## Grounding Metadata

When grounding is used, responses include:
- Source links and citations
- Confidence scores
- Grounding attribution
- Search suggestions (when applicable)

## Integration with Genkit

To enable grounding in Genkit workflows:

```typescript
// src/ai/genkit.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      // Configuration for grounding tools
    }),
  ],
});
```

```json
// workflow.json stage configuration
{
  "id": "grounded-stage",
  "model": "googleai/gemini-2.5-flash",
  "toolNames": ["googleSearch"],  // Enable search grounding
  "generationConfig": {
    "temperature": 0.0
  }
}
```

## Model-Specific Notes

### Gemini 2.5 Series
- Latest grounding capabilities
- Search as Tool approach
- Best performance with structured queries

### Gemini 2.0 Flash
- Full grounding support
- Native tool use
- Efficient for real-time applications

### Gemini 1.5 Series
- Legacy dynamic retrieval approach
- Still supported but older method
- May be deprecated in future

### Gemini 2.0 Flash-Lite
- No grounding capabilities
- Optimized for speed over features
- Use other models if grounding needed

## Future Considerations

- Grounding capabilities are actively evolving
- Check documentation regularly for updates
- New models may have enhanced grounding features
- API interfaces may change between versions