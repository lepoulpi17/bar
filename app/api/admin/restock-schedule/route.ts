import { NextRequest, NextResponse } from 'next/server';
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

    const schedules = await prisma.restockSchedule.findMany({
      orderBy: [
        { completed: 'asc' },
        { scheduledDate: 'asc' },
      ],
    });

    const ingredients = await prisma.ingredient.findMany({
      select: { id: true, name: true },
    });

    const schedulesWithIngredients = schedules.map((schedule) => {
      const ingredient = ingredients.find((i) => i.id === schedule.ingredientId);
      return {
        ...schedule,
        ingredientName: ingredient?.name || 'Inconnu',
      };
    });

    return NextResponse.json(schedulesWithIngredients);
  } catch (error) {
    console.error('Erreur récupération planning:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { ingredientId, scheduledDate, quantity, unit, notes } = body;

    const schedule = await prisma.restockSchedule.create({
      data: {
        ingredientId,
        scheduledDate: new Date(scheduledDate),
        quantity,
        unit,
        notes,
      },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error('Erreur création planning:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
