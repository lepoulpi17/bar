import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const ingredientSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  subcategory: z.string().nullable().optional(),
  isAlcoholic: z.boolean(),
  baseSpirit: z.string().nullable().optional(),
  costPerUnit: z.number().nullable().optional(),
  costUnit: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const ingredients = await prisma.ingredient.findMany({
      include: {
        _count: {
          select: {
            cocktailIngredients: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(ingredients);
  } catch (error) {
    console.error('Erreur récupération ingrédients:', error);
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
    const data = ingredientSchema.parse(body);

    const ingredient = await prisma.ingredient.create({
      data,
    });

    await prisma.barAvailability.create({
      data: {
        ingredientId: ingredient.id,
        available: false,
      },
    });

    return NextResponse.json(ingredient, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: error.errors }, { status: 400 });
    }
    console.error('Erreur création ingrédient:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
