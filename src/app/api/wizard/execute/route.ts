import { runAiStage } from '@/app/actions/aiActions-new';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await runAiStage(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'AI execution failed' }, 
      { status: 500 }
    );
  }
}