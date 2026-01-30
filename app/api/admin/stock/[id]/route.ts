import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const stock = await prisma.stock.findUnique({
      where: { id: params.id },
      include: {
        ingredient: true,
        movements: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!stock) {
      return NextResponse.json({ error: 'Stock non trouvé' }, { status: 404 });
    }

    return NextResponse.json(stock);
  } catch (error) {
    console.error('Erreur lors de la récupération du stock:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { minThreshold, maxThreshold, unit } = body;

    const stock = await prisma.stock.update({
      where: { id: params.id },
      data: {
        ...(minThreshold !== undefined && { minThreshold }),
        ...(maxThreshold !== undefined && { maxThreshold }),
        ...(unit && { unit }),
      },
      include: {
        ingredient: true,
      },
    });

    return NextResponse.json(stock);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du stock:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await prisma.stock.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du stock:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
