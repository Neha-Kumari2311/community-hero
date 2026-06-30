import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { analyzeIssueImage } from '@/lib/gemini';

// POST - Analyze an uploaded image with AI
export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('OPENROUTER_API_KEY is missing. Get one from https://openrouter.ai/keys');
      return NextResponse.json(
        { error: 'AI service is not configured. Please set OPENROUTER_API_KEY in .env.local' },
        { status: 503 }
      );
    }

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
    
    const errorMessage = error?.message || '';
    
    // Quota exceeded
    if (errorMessage.includes('quota') || errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.includes('Too Many Requests')) {
      return NextResponse.json(
        { error: 'AI service rate limited. Please try again later or add credits at https://openrouter.ai/credits' },
        { status: 429 }
      );
    }
    
    // Invalid API key
    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('401') || errorMessage.includes('403')) {
      return NextResponse.json(
        { error: 'Invalid OpenRouter API key. Please check OPENROUTER_API_KEY in .env.local' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
