/**
 * Streaming API Route
 * Provides streaming text generation capabilities
 */

import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/genai';

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

    const genAI = new GoogleGenerativeAI(apiKey);
    const genModel = genAI.getGenerativeModel({ 
      model,
      generationConfig: config
    });

    const result = await genModel.generateContentStream(prompt);

    // Create a TransformStream to handle the streaming
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            // Send as Server-Sent Events format
            const data = `data: ${JSON.stringify({ text })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
          
          // Send completion event
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
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
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate content' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}