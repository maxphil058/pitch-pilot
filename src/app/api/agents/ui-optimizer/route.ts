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
            content: `Given this copy - Headline: "${body.copy.headline}", Body: "${body.copy.body}" - suggest ONE minimal UI tweak to improve conversion. Return only JSON with "tweak" object containing either "ctaColor" (valid hex like #FF5733) or "ctaText" (short button text) or both. Max 2 fields. Focus on psychology and conversion optimization.`
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let result;
    try {
      result = JSON.parse(content);
    } catch {
      // Fallback parsing if OpenAI doesn't return pure JSON
      const colorMatch = content.match(/#[0-9A-Fa-f]{6}/);
      const textMatch = content.match(/"ctaText":\s*"([^"]+)"/);
      
      result = {
        tweak: {
          ctaColor: colorMatch ? colorMatch[0] : '#FF5733',
          ...(textMatch && { ctaText: textMatch[1] })
        }
      };
    }

    // Ensure we have a valid tweak object
    if (!result.tweak) {
      result = { tweak: { ctaColor: '#FF5733' } };
    }

    // Publish event
    await publishEvent({
      topic: 'pitchpilot/ui/done',
      payload: { tweak: result.tweak }
    });

    return NextResponse.json({
      tweak: result.tweak
    });

  } catch (error) {
    console.error('UI Optimizer agent error:', error);
    return NextResponse.json(
      { error: 'Failed to generate UI optimization' },
      { status: 500 }
    );
  }
}
