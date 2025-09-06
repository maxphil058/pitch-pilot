import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { publishEvent } from '@/lib/solace';

export const runtime = 'nodejs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Create test transaction
    const amount = 100; // $1.00 in cents
    const currency = 'USD';

    await prisma.transaction.create({
      data: {
        amount,
        currency,
      },
    });

    console.log('Test transaction created:', { amount, currency });

    // Publish checkout success event
    await publishEvent({
      topic: 'pitchpilot/checkout/success',
      payload: { amount, currency }
    });

    // Call Analytics agent (non-blocking)
    try {
      const analyticsResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/agents/analytics/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'checkout_success',
          data: { amount, currency }
        }),
      });
      
      if (!analyticsResponse.ok) {
        console.error('Analytics agent call failed:', analyticsResponse.status);
      }
    } catch (analyticsError) {
      console.error('Failed to call analytics agent:', analyticsError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Test sale simulated successfully',
      transaction: { amount, currency }
    });

  } catch (error) {
    console.error('Simulate sale error:', error);
    return NextResponse.json(
      { error: 'Failed to simulate sale' },
      { status: 500 }
    );
  }
}
