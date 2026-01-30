import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

    await prisma.cocktailView.create({
      data: {
        cocktailId: params.id,
        userId: session?.user?.id || null,
        ipAddress,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur enregistrement vue:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
