import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  await prisma.shipping_Freight_Rate.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 