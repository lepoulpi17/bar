import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const availability = await prisma.barAvailability.findMany({
      include: {
        ingredient: true,
      },
    });

    return NextResponse.json(availability);
  } catch (error) {
    console.error('Erreur récupération disponibilité:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

const updateSchema = z.array(
  z.object({
    ingredientId: z.string(),
    available: z.boolean(),
  })
);

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const updates = updateSchema.parse(body);

    for (const update of updates) {
      await prisma.barAvailability.upsert({
        where: { ingredientId: update.ingredientId },
        update: { available: update.available },
        create: {
          ingredientId: update.ingredientId,
          available: update.available,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }
    console.error('Erreur mise à jour disponibilité:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
