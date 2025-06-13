import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('[TEST-SIMPLE] GET request received at:', new Date().toISOString());
  return NextResponse.json({ 
    message: 'Simple test endpoint working',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  console.log('[TEST-SIMPLE] POST request received at:', new Date().toISOString());
  try {
    const body = await request.json();
    console.log('[TEST-SIMPLE] Request body:', body);
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json({ 
      message: 'Simple test endpoint working',
      echo: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[TEST-SIMPLE] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}