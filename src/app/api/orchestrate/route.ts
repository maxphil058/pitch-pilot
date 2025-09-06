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

    // Step 1: Call Copywriter
    const copywriterResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/agents/copywriter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idea: body.idea }),
    });

    if (!copywriterResponse.ok) {
      throw new Error('Copywriter agent failed');
    }

    const copy = await copywriterResponse.json();

    // Publish orchestrator step
    await publishEvent({
      topic: 'pitchpilot/orchestrator/step',
      payload: { step: 'copywriter', copy }
    });

    // Step 2: Call UI Optimizer
    const uiOptimizerResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/agents/ui-optimizer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ copy }),
    });

    if (!uiOptimizerResponse.ok) {
      throw new Error('UI Optimizer agent failed');
    }

    const uiResult = await uiOptimizerResponse.json();
    const tweak = uiResult.tweak;

    // Publish orchestrator step
    await publishEvent({
      topic: 'pitchpilot/orchestrator/step',
      payload: { step: 'ui-optimizer', tweak }
    });

    // Step 3: Call Video Agent
    const videoResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/agents/video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ copy }),
    });

    if (!videoResponse.ok) {
      throw new Error('Video agent failed');
    }

    const videoResult = await videoResponse.json();
    const script = videoResult.script;

    // Publish orchestrator step
    await publishEvent({
      topic: 'pitchpilot/orchestrator/step',
      payload: { step: 'video', script: !!script }
    });

    return NextResponse.json({
      copy,
      tweak,
      script
    });

  } catch (error) {
    console.error('Orchestrator error:', error);
    return NextResponse.json(
      { error: 'Failed to orchestrate agents' },
      { status: 500 }
    );
  }
}
