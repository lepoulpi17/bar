import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const ingredientSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  subcategory: z.string().nullable().optional(),
  isAlcoholic: z.boolean(),
  baseSpirit: z.string().nullable().optional(),
});

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
    const data = ingredientSchema.parse(body);

    const ingredient = await prisma.ingredient.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(ingredient);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: error.errors }, { status: 400 });
    }
    console.error('Erreur mise à jour ingrédient:', error);
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

    await prisma.ingredient.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression ingrédient:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
