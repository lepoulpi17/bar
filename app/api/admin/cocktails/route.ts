import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const cocktailIngredientSchema = z.object({
  ingredientId: z.string().min(1),
  quantity: z.number().nullable().optional(),
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

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const cocktails = await prisma.cocktail.findMany({
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(cocktails);
  } catch (error) {
    console.error('Erreur récupération cocktails:', error);
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
    console.log('Body reçu (création):', JSON.stringify(body, null, 2));

    const validationResult = cocktailSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Erreur de validation:', validationResult.error);
      return NextResponse.json({
        error: 'Données invalides',
        details: validationResult.error.errors
      }, { status: 400 });
    }

    const { ingredients, ...cocktailData } = validationResult.data;

    const cocktail = await prisma.cocktail.create({
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

    return NextResponse.json(cocktail, { status: 201 });
  } catch (error) {
    console.error('Erreur création cocktail:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
