import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const cocktailIngredientSchema = z.object({
  ingredientId: z.string().min(1),
  quantity: z.union([z.number(), z.string()]).nullable().optional().transform(val => {
    if (val === null || val === undefined || val === '') return null;
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? null : num;
  }),
  unit: z.string().nullable().optional().transform(val => val === '' ? null : val),
  isOptional: z.boolean().default(false),
});

const cocktailSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional().transform(val => val === '' ? null : val),
  type: z.string().min(1),
  baseSpirit: z.string().nullable().optional().transform(val => val === '' ? null : val),
  glass: z.string().min(1),
  ice: z.boolean(),
  iceType: z.string().nullable().optional().transform(val => val === '' ? null : val),
  method: z.string().min(1),
  garnish: z.string().nullable().optional().transform(val => val === '' ? null : val),
  imageUrl: z.string().nullable().optional().transform(val => val === '' ? null : val),
  ingredients: z.array(cocktailIngredientSchema).min(1),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const cocktail = await prisma.cocktail.findUnique({
      where: { id: params.id },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    if (!cocktail) {
      return NextResponse.json({ error: 'Cocktail non trouvé' }, { status: 404 });
    }

    return NextResponse.json(cocktail);
  } catch (error) {
    console.error('Erreur récupération cocktail:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    console.log('Body reçu:', JSON.stringify(body, null, 2));

    const validationResult = cocktailSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Erreur de validation:', validationResult.error);
      return NextResponse.json({
        error: 'Données invalides',
        details: validationResult.error.errors
      }, { status: 400 });
    }

    const { ingredients, ...cocktailData } = validationResult.data;

    await prisma.cocktailIngredient.deleteMany({
      where: { cocktailId: params.id },
    });

    const cocktail = await prisma.cocktail.update({
      where: { id: params.id },
      data: {
        ...cocktailData,
        ingredients: {
          create: ingredients.map((ing) => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
            unit: ing.unit,
            isOptional: ing.isOptional,
          })),
        },
      },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    return NextResponse.json(cocktail);
  } catch (error) {
    console.error('Erreur mise à jour cocktail:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await prisma.cocktail.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression cocktail:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
