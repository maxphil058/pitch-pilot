import { NextRequest, NextResponse } from 'next/server';
import { publishEvent } from '@/lib/solace';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    if (!body.idea || typeof body.idea !== 'string') {
      return NextResponse.json(
        { error: 'Idea is required and must be a string' },
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
            content: `Create a compelling headline and body copy for this startup idea: "${body.idea}". Return only JSON with "headline" and "body" fields. Keep headline under 60 chars, body under 150 chars. Focus on conversion and value proposition.`
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
      const headlineMatch = content.match(/"headline":\s*"([^"]+)"/);
      const bodyMatch = content.match(/"body":\s*"([^"]+)"/);
      
      result = {
        headline: headlineMatch ? headlineMatch[1] : 'Transform Your Business Today',
        body: bodyMatch ? bodyMatch[1] : 'Join thousands who are already succeeding with our proven solution.'
      };
    }

    // Publish event
    await publishEvent({
      topic: 'pitchpilot/copywriter/done',
      payload: { headline: result.headline, body: result.body }
    });

    return NextResponse.json({
      headline: result.headline,
      body: result.body
    });

  } catch (error) {
    console.error('Copywriter agent error:', error);
    return NextResponse.json(
      { error: 'Failed to generate copy' },
      { status: 500 }
    );
  }
}
