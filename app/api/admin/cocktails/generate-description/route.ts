import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { name, type, baseSpirit, ingredients, garnish } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nom du cocktail requis' }, { status: 400 });
    }

    const ingredientsList = ingredients
      ?.filter((ing: any) => ing.ingredientName)
      .map((ing: any) => ing.ingredientName)
      .join(', ') || 'ingrédients sélectionnés';

    let description = `Le ${name} est un `;

    if (type === 'Short drink') {
      description += 'cocktail court et concentré';
    } else if (type === 'Long drink') {
      description += 'cocktail long et rafraîchissant';
    } else if (type === 'Shot') {
      description += 'shot intense';
    } else {
      description += 'cocktail';
    }

    if (baseSpirit) {
      description += ` à base de ${baseSpirit}`;
    }

    description += `. `;

    const ingredientsArray = ingredients?.filter((ing: any) => ing.ingredientName) || [];
    if (ingredientsArray.length > 0) {
      if (ingredientsArray.length === 1) {
        description += `Composé principalement de ${ingredientsArray[0].ingredientName}`;
      } else if (ingredientsArray.length === 2) {
        description += `Alliant ${ingredientsArray[0].ingredientName} et ${ingredientsArray[1].ingredientName}`;
      } else {
        const lastIngredient = ingredientsArray[ingredientsArray.length - 1].ingredientName;
        const otherIngredients = ingredientsArray
          .slice(0, -1)
          .map((ing: any) => ing.ingredientName)
          .join(', ');
        description += `Mêlant ${otherIngredients} et ${lastIngredient}`;
      }
      description += ', ';
    }

    if (type === 'Short drink') {
      description += 'ce cocktail offre une expérience gustative intense et sophistiquée';
    } else if (type === 'Long drink') {
      description += 'ce cocktail désaltérant est parfait pour toutes les occasions';
    } else if (type === 'Shot') {
      description += 'ce shot apporte une explosion de saveurs en une seule gorgée';
    } else {
      description += 'ce cocktail saura ravir vos papilles';
    }

    description += '.';

    if (garnish) {
      description += ` Sublimé par ${garnish}, il allie élégance et saveur.`;
    } else {
      description += ' Un classique incontournable du bar.';
    }

    return NextResponse.json({ description });
  } catch (error) {
    console.error('Erreur génération description:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
