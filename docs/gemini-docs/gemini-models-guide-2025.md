# Google Gemini Models Guide (June 2025)

This guide provides comprehensive information about Google's Gemini models available through the Google AI API (ai.google.dev).

## Available Models Overview

### Production-Ready Models

#### Gemini 2.5 Flash (Preview)
- **Status**: Preview (use with caution in production)
- **Description**: Best price-performance model with adaptive thinking
- **Context Window**: 1,048,576 tokens
- **Inputs**: Text, images, audio, video
- **Output**: Text
- **Key Features**: 
  - Adaptive thinking capabilities
  - Cost-efficient
  - Multimodal support
- **Pricing**:
  - Free Tier: Available
  - Paid: $0.15/1M input tokens, $0.60/1M output tokens (non-thinking), $3.50/1M (thinking)

#### Gemini 2.0 Flash
- **Status**: Stable
- **Description**: Next-gen features with improved capabilities
- **Context Window**: 1,048,576 tokens (1M)
- **Inputs**: Text, images, audio, video
- **Output**: Text
- **Key Features**:
  - Native tool use
  - Image generation capability
  - Live API support
- **Pricing**:
  - Free Tier: Available
  - Paid: $0.10/1M input tokens, $0.40/1M output tokens
  - Image generation: $0.039 per image

#### Gemini 1.5 Pro
- **Status**: Stable
- **Description**: Mid-size multimodal model for complex tasks
- **Context Window**: 2,097,152 tokens (2M)
- **Inputs**: Text, images, audio, video
- **Output**: Text
- **Key Features**:
  - Can process up to 2 hours of video
  - Can process up to 19 hours of audio
  - Largest context window
- **Pricing**: Check ai.google.dev/pricing for current rates

#### Gemini 1.5 Flash
- **Status**: Stable
- **Description**: Fast, cost-efficient model
- **Context Window**: 1,048,576 tokens
- **Inputs**: Text, images, audio, video
- **Output**: Text
- **Pricing**: Check ai.google.dev/pricing for current rates

### Experimental Models

#### Gemini 2.5 Pro Preview
- **Status**: Experimental/Preview
- **Description**: Most powerful thinking model with maximum response accuracy
- **Context Window**: 1,048,576 tokens
- **Warning**: Not recommended for production use
- **Pricing**:
  - Input: $1.25-$2.50/1M tokens (varies by prompt length)
  - Output: $10-$15/1M tokens

### Specialized Models

- **Imagen 3**: Image generation
- **Veo 2**: Video generation
- **Text Embedding 004**: Text embeddings for similarity/search

## Model Recommendations

### For Fast, Modern Production Use

**Recommended: Gemini 2.0 Flash**
- Stable and production-ready
- Excellent balance of speed and capability
- Native tool use support
- Cost-effective at $0.10/1M input tokens
- Used in official quickstart examples

### For Cost-Sensitive Applications

**Recommended: Gemini 2.0 Flash or 2.5 Flash (Preview)**
- 2.0 Flash: Most stable, lowest cost
- 2.5 Flash: Better performance but still in preview

### For Maximum Context Length

**Recommended: Gemini 1.5 Pro**
- 2M token context window
- Best for processing long documents, videos, or audio

### For Cutting-Edge Features

**Use with Caution: Gemini 2.5 Pro Preview**
- Most powerful reasoning
- Expensive ($10-15/1M output tokens)
- May change without notice

## Free Tier Limits

Most models offer free tier access with the following typical limits:
- Rate limits vary by model
- Free usage through Google AI Studio
- API key required for programmatic access

## Important Considerations

1. **Experimental Models**: 
   - Can be swapped without prior notice
   - More restrictive rate limits
   - Not suitable for production

2. **Preview Models**:
   - May change before becoming stable
   - Use with caution in production

3. **Model Selection**:
   - Start with Gemini 2.0 Flash for most use cases
   - Upgrade to Pro models only when needed
   - Test experimental models in development only

## Integration Example

```javascript
// Using Gemini 2.0 Flash (recommended)
const model = genkit.getGenerativeModel({ 
  model: "gemini-2.0-flash" 
});
```

## Additional Resources

- [Get API Key](https://aistudio.google.com/apikey)
- [Google AI Studio](https://aistudio.google.com)
- [Official Documentation](https://ai.google.dev/gemini-api/docs)
- [Pricing Details](https://ai.google.dev/pricing)

## Notes for Franz AI Writer

Based on this research, the current model configuration in your project:
- `googleai/gemini-2.0-flash-exp` should be updated to `googleai/gemini-2.0-flash` for stability
- This provides the best balance of features, speed, and cost for your workflow system
- The 1M token context window is sufficient for most document generation tasks