import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const stockId = searchParams.get('stockId');

    const where = stockId ? { stockId } : {};

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        stock: {
          include: {
            ingredient: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(movements);
  } catch (error) {
    console.error('Erreur lors de la récupération des mouvements:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { stockId, type, quantity, unit, reason } = body;

    if (!stockId || !type || !quantity) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const stock = await prisma.stock.findUnique({
      where: { id: stockId },
    });

    if (!stock) {
      return NextResponse.json({ error: 'Stock non trouvé' }, { status: 404 });
    }

    let newQuantity = new Decimal(stock.quantity.toString());
    const movementQuantity = new Decimal(quantity.toString());

    if (type === 'restock' || type === 'adjustment') {
      newQuantity = newQuantity.add(movementQuantity);
    } else if (type === 'usage' || type === 'waste') {
      newQuantity = newQuantity.sub(movementQuantity);
      if (newQuantity.lessThan(0)) {
        return NextResponse.json(
          { error: 'Quantité insuffisante en stock' },
          { status: 400 }
        );
      }
    }

    const [movement, updatedStock] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          stockId,
          type,
          quantity: movementQuantity,
          unit: unit || stock.unit,
          reason,
          userId: session.user.id,
        },
      }),
      prisma.stock.update({
        where: { id: stockId },
        data: {
          quantity: newQuantity,
          ...(type === 'restock' && { lastRestockDate: new Date() }),
        },
        include: {
          ingredient: true,
        },
      }),
    ]);

    return NextResponse.json({ movement, stock: updatedStock });
  } catch (error) {
    console.error('Erreur lors de la création du mouvement:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
