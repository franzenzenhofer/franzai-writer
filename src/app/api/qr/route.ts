import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    
    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }
    
    // For now, use a simple QR code service (you can replace this with qrcode library later)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    
    // Fetch the QR code image
    const response = await fetch(qrCodeUrl);
    const imageBuffer = await response.arrayBuffer();
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[QR API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
} 