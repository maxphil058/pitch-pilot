import { NextRequest, NextResponse } from 'next/server';
import { publishEvent } from '@/lib/solace';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    if (!body.type || typeof body.type !== 'string') {
      return NextResponse.json(
        { error: 'Type is required and must be a string' },
        { status: 400 }
      );
    }

    if (!body.data) {
      return NextResponse.json(
        { error: 'Data is required' },
        { status: 400 }
      );
    }

    // Handle checkout_success type specifically
    if (body.type === 'checkout_success') {
      // Check for OpenAI API key
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is required');
      }

      // Call OpenAI API for A/B suggestion
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
              content: `A checkout was completed for: ${JSON.stringify(body.data)}. Provide ONE specific A/B test suggestion to improve conversion rates further. Keep it under 100 characters and actionable.`
            }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const suggestion = data.choices[0].message.content.trim();

      // Publish event
      await publishEvent({
        topic: 'pitchpilot/analytics/ab-suggestion',
        payload: { suggestion }
      });

      return NextResponse.json({
        ok: true,
        suggestion
      });
    }

    // For other types, just log and return ok
    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Analytics agent error:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics event' },
      { status: 500 }
    );
  }
}
