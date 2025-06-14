/**
 * Streaming API Route
 * Provides streaming text generation capabilities
 */

import { NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = 'gemini-2.0-flash', config = {} } = await request.json();

    if (!prompt) {
      return new Response('Prompt is required', { status: 400 });
    }

    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      return new Response('API key not configured', { status: 500 });
    }

    const genAI = new GoogleGenAI({ apiKey });
    
    console.log('📤 [AI STREAM REQUEST]:', {
      model,
      promptLength: prompt.length,
      config
    });
    
    // Use the correct @google/genai API
    const result = await genAI.models.generateContentStream({
      model,
      contents: prompt,
      config: {
        temperature: config.temperature,
        maxTokens: config.maxOutputTokens,
        topP: config.topP,
        topK: config.topK,
        stopSequences: config.stopSequences
      },
      systemInstruction: config.systemInstruction
    });

    // Create a TransformStream to handle the streaming
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let chunkCount = 0;
          let totalText = '';
          
          for await (const chunk of result) {
            const text = chunk.text || '';
            totalText += text;
            chunkCount++;
            
            // Send as Server-Sent Events format
            const data = `data: ${JSON.stringify({ text })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
          
          console.log('📥 [AI STREAM RESPONSE] Complete:', {
            chunkCount,
            totalLength: totalText.length,
            preview: totalText.substring(0, 100) + '...'
          });
          
          // Send completion event
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('❌ [AI STREAM ERROR]:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('❌ [AI STREAM API ERROR]:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate content',
        details: errorMessage 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}