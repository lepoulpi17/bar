import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const ingredients = await prisma.ingredient.findMany({
      include: {
        barAvailability: true,
      },
      orderBy: {
        category: 'asc',
      },
    });

    return NextResponse.json(ingredients);
  } catch (error) {
    console.error('Erreur récupération ingrédients:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
