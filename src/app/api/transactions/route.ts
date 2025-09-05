import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const runtime = 'nodejs';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    const totalRevenue = await prisma.transaction.aggregate({
      _sum: {
        amount: true
      }
    });

    return NextResponse.json({
      transactions,
      totalRevenue: totalRevenue._sum.amount || 0
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
