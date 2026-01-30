import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const [
      totalCocktails,
      totalIngredients,
      totalUsers,
      lowStockCount,
      totalViews,
      recentViews,
      popularCocktails,
      stockAlerts,
    ] = await Promise.all([
      prisma.cocktail.count(),
      prisma.ingredient.count(),
      prisma.user.count(),
      prisma.stock.count({
        where: {
          AND: [
            { quantity: { lte: prisma.stock.fields.minThreshold } },
            { minThreshold: { not: null } },
          ],
        },
      }),
      prisma.cocktailView.count(),
      prisma.cocktailView.count({
        where: {
          viewedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.cocktailView.groupBy({
        by: ['cocktailId'],
        _count: { cocktailId: true },
        orderBy: { _count: { cocktailId: 'desc' } },
        take: 5,
      }),
      prisma.stock.findMany({
        where: {
          AND: [
            { quantity: { lte: prisma.stock.fields.minThreshold } },
            { minThreshold: { not: null } },
          ],
        },
        include: {
          ingredient: true,
        },
        take: 10,
      }),
    ]);

    const cocktailIds = popularCocktails.map((v) => v.cocktailId);
    const cocktailDetails = await prisma.cocktail.findMany({
      where: { id: { in: cocktailIds } },
      select: { id: true, name: true, imageUrl: true },
    });

    const popularCocktailsWithDetails = popularCocktails.map((view) => {
      const cocktail = cocktailDetails.find((c) => c.id === view.cocktailId);
      return {
        id: view.cocktailId,
        name: cocktail?.name || 'Unknown',
        imageUrl: cocktail?.imageUrl,
        views: view._count.cocktailId,
      };
    });

    return NextResponse.json({
      overview: {
        totalCocktails,
        totalIngredients,
        totalUsers,
        lowStockCount,
        totalViews,
        recentViews,
      },
      popularCocktails: popularCocktailsWithDetails,
      stockAlerts: stockAlerts.map((stock) => ({
        id: stock.id,
        ingredientName: stock.ingredient.name,
        quantity: stock.quantity,
        unit: stock.unit,
        minThreshold: stock.minThreshold,
      })),
    });
  } catch (error) {
    console.error('Erreur récupération stats:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
