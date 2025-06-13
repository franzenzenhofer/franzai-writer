import { NextResponse } from 'next/server';

export async function GET() {
  console.log('[test-route] GET request received');
  
  return NextResponse.json({
    message: 'Test route is working!',
    timestamp: new Date().toISOString(),
    status: 'ok'
  });
}