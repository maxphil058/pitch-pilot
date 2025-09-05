import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    let amount = session.amount_total;
    let currency = session.currency;

    // Fallback: if amount_total is null, get from payment intent
    if (!amount && session.payment_intent) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          session.payment_intent as string
        );
        amount = paymentIntent.amount;
        currency = paymentIntent.currency;
      } catch (error) {
        console.error('Failed to retrieve payment intent:', error);
      }
    }

    if (amount && currency) {
      try {
        await prisma.transaction.create({
          data: {
            amount,
            currency: currency.toUpperCase(),
          },
        });
        console.log('Transaction recorded:', { amount, currency });
      } catch (error) {
        console.error('Failed to record transaction:', error);
      }
    }
  }

  return NextResponse.json({ received: true });
}
