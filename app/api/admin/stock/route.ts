import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const stocks = await prisma.stock.findMany({
      include: {
        ingredient: true,
        movements: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: {
        ingredient: {
          name: 'asc',
        },
      },
    });

    const ingredients = await prisma.ingredient.findMany({
      where: {
        stock: null,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      stocks,
      ingredientsWithoutStock: ingredients,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des stocks:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { ingredientId, quantity, unit, minThreshold, maxThreshold } = body;

    if (!ingredientId) {
      return NextResponse.json(
        { error: 'Ingrédient requis' },
        { status: 400 }
      );
    }

    const stock = await prisma.stock.create({
      data: {
        ingredientId,
        quantity: quantity || 0,
        unit: unit || 'ml',
        minThreshold: minThreshold || null,
        maxThreshold: maxThreshold || null,
        lastRestockDate: quantity > 0 ? new Date() : null,
      },
      include: {
        ingredient: true,
      },
    });

    if (quantity > 0) {
      await prisma.stockMovement.create({
        data: {
          stockId: stock.id,
          type: 'restock',
          quantity,
          unit: unit || 'ml',
          reason: 'Stock initial',
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json(stock);
  } catch (error) {
    console.error('Erreur lors de la création du stock:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
