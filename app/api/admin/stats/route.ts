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

    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalCocktails,
      totalIngredients,
      totalUsers,
      lowStockCount,
      totalViews,
      recentViews,
      popularCocktails,
      stockAlerts,
      viewsLast30Days,
      stockMovementsLast30Days,
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
            gte: last7Days,
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
      prisma.cocktailView.findMany({
        where: {
          viewedAt: {
            gte: last30Days,
          },
        },
        select: {
          viewedAt: true,
        },
      }),
      prisma.stockMovement.findMany({
        where: {
          createdAt: {
            gte: last30Days,
          },
        },
        select: {
          type: true,
          createdAt: true,
        },
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

    const viewsByDay = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const count = viewsLast30Days.filter(
        (v) => v.viewedAt >= dayStart && v.viewedAt <= dayEnd
      ).length;

      return {
        date: dayStart.toISOString().split('T')[0],
        views: count,
      };
    });

    const movementsByDay = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayMovements = stockMovementsLast30Days.filter(
        (m) => m.createdAt >= dayStart && m.createdAt <= dayEnd
      );

      const restocks = dayMovements.filter((m) => m.type === 'restock').length;
      const usage = dayMovements.filter((m) => m.type === 'usage').length;
      const waste = dayMovements.filter((m) => m.type === 'waste').length;

      return {
        date: dayStart.toISOString().split('T')[0],
        restocks,
        usage,
        waste,
        total: dayMovements.length,
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
      viewsByDay,
      movementsByDay,
    });
  } catch (error) {
    console.error('Erreur récupération stats:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
