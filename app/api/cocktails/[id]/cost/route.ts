import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    let totalCost = 0;
    const breakdown: Array<{
      ingredientName: string;
      quantity: number;
      unit: string;
      costPerUnit: number | null;
      subtotal: number | null;
    }> = [];

    for (const ci of cocktail.ingredients) {
      const ingredient = ci.ingredient;
      const quantity = ci.quantity ? Number(ci.quantity) : 0;
      const costPerUnit = ingredient.costPerUnit ? Number(ingredient.costPerUnit) : null;

      let subtotal: number | null = null;
      if (costPerUnit && quantity) {
        subtotal = costPerUnit * quantity;
        totalCost += subtotal;
      }

      breakdown.push({
        ingredientName: ingredient.name,
        quantity,
        unit: ci.unit || '',
        costPerUnit,
        subtotal,
      });
    }

    return NextResponse.json({
      cocktailId: cocktail.id,
      cocktailName: cocktail.name,
      totalCost: totalCost > 0 ? totalCost : null,
      breakdown,
      hasAllCosts: breakdown.every((item) => item.costPerUnit !== null && item.quantity > 0),
    });
  } catch (error) {
    console.error('Erreur calcul coût:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
