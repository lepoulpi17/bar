import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const baseSpirit = searchParams.get('baseSpirit') || '';
    const mode = searchParams.get('mode') || 'all';

    const cocktails = await prisma.cocktail.findMany({
      where: {
        ...(search && {
          name: {
            contains: search,
          },
        }),
        ...(baseSpirit && baseSpirit !== 'all' && {
          baseSpirit: baseSpirit,
        }),
      },
      include: {
        ingredients: {
          include: {
            ingredient: {
              include: {
                barAvailability: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const cocktailsWithAvailability = cocktails.map((cocktail) => {
      const requiredIngredients = cocktail.ingredients.filter((ci) => !ci.isOptional);
      const availableCount = requiredIngredients.filter(
        (ci) => ci.ingredient.barAvailability?.available
      ).length;
      const missingCount = requiredIngredients.length - availableCount;
      const missingIngredients = requiredIngredients
        .filter((ci) => !ci.ingredient.barAvailability?.available)
        .map((ci) => ci.ingredient.name);

      return {
        ...cocktail,
        availableCount,
        missingCount,
        missingIngredients,
        isDoable: missingCount === 0,
        isAlmost: missingCount > 0 && missingCount <= 2,
      };
    });

    let filteredCocktails = cocktailsWithAvailability;

    if (mode === 'doable') {
      filteredCocktails = cocktailsWithAvailability.filter((c) => c.isDoable);
    } else if (mode === 'almost') {
      filteredCocktails = cocktailsWithAvailability.filter((c) => c.isAlmost);
    }

    return NextResponse.json(filteredCocktails);
  } catch (error) {
    console.error('Erreur récupération cocktails:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
