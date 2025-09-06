import { NextRequest, NextResponse } from 'next/server';
import { publishEvent } from '@/lib/solace';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    if (!body.copy || !body.copy.headline || !body.copy.body) {
      return NextResponse.json(
        { error: 'Copy object with headline and body is required' },
        { status: 400 }
      );
    }

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required');
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a concise marketing and CRO assistant. Keep outputs tight and actionable.'
          },
          {
            role: 'user',
            content: `Create a 6-8 line TikTok-style launch video script for this copy - Headline: "${body.copy.headline}", Body: "${body.copy.body}". Structure: Hook (1-2 lines) → Value (3-4 lines) → CTA (1-2 lines). Make it engaging and conversion-focused. Return only the script text, no JSON.`
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const script = data.choices[0].message.content.trim();

    // Publish event
    await publishEvent({
      topic: 'pitchpilot/video/script',
      payload: { script }
    });

    return NextResponse.json({
      script
    });

  } catch (error) {
    console.error('Video agent error:', error);
    return NextResponse.json(
      { error: 'Failed to generate video script' },
      { status: 500 }
    );
  }
}
