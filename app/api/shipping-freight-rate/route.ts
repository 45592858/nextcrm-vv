import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const rates = await prisma.shipping_Freight_Rate.findMany({ orderBy: { created_at: 'desc' } });
  return NextResponse.json(rates);
}

export async function POST(req: Request) {
  const data = await req.json();
  // 校验
  if (!data.to_country || !data.price_text || !data.valid_until) {
    return NextResponse.json({ error: '参数不完整' }, { status: 400 });
  }
  const rate = await prisma.shipping_Freight_Rate.create({ data });
  return NextResponse.json(rate);
} 