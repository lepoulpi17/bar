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

    const [
      totalCocktails,
      totalIngredients,
      totalUsers,
      lowStockCount,
      availableIngredientsCount,
      stockAlerts,
      stockMovementsLast30Days,
      recentActivity,
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
      prisma.barAvailability.count({
        where: {
          available: true,
        },
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
        orderBy: {
          quantity: 'asc',
        },
        take: 10,
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
      prisma.auditLog.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          action: true,
          userEmail: true,
          entityName: true,
          createdAt: true,
        },
      }),
    ]);

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
        totalStockValue: 0,
        availableIngredientsCount,
      },
      stockAlerts: stockAlerts.map((stock) => ({
        id: stock.id,
        ingredientName: stock.ingredient.name,
        quantity: stock.quantity,
        unit: stock.unit,
        minThreshold: stock.minThreshold,
      })),
      movementsByDay,
      recentActivity: recentActivity.map((activity) => ({
        id: activity.id,
        action: activity.action,
        userEmail: activity.userEmail || 'Système',
        entityName: activity.entityName || 'N/A',
        createdAt: activity.createdAt,
      })),
    });
  } catch (error) {
    console.error('Erreur récupération stats:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
