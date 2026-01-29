import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const cocktail = await prisma.cocktail.findUnique({
      where: { id: params.id },
      include: {
        ingredients: {
          include: {
            ingredient: {
              include: {
                barAvailability: true,
              },
            },
          },
          orderBy: {
            isOptional: 'asc',
          },
        },
      },
    });

    if (!cocktail) {
      return NextResponse.json({ error: 'Cocktail non trouvé' }, { status: 404 });
    }

    const requiredIngredients = cocktail.ingredients.filter((ci) => !ci.isOptional);
    const availableCount = requiredIngredients.filter(
      (ci) => ci.ingredient.barAvailability?.available
    ).length;
    const missingCount = requiredIngredients.length - availableCount;
    const missingIngredients = requiredIngredients
      .filter((ci) => !ci.ingredient.barAvailability?.available)
      .map((ci) => ci.ingredient.name);

    return NextResponse.json({
      ...cocktail,
      availableCount,
      missingCount,
      missingIngredients,
      isDoable: missingCount === 0,
    });
  } catch (error) {
    console.error('Erreur récupération cocktail:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
