import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { analyzeIssueImage } from '@/lib/gemini';

// POST - Analyze an uploaded image with AI
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image, mimeType } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'Please provide an image' },
        { status: 400 }
      );
    }

    // Remove data URL prefix if present
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    const type = mimeType || 'image/jpeg';

    const analysis = await analyzeIssueImage(base64Data, type);

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error('Analyze image error:', error?.message || error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
