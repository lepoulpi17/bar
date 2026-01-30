import { NextResponse } from 'next/server';
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

    const cocktails = await prisma.cocktail.findMany({
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const csvHeaders = [
      'ID',
      'Nom',
      'Type',
      'Verre',
      'Alcool de base',
      'Glaçons',
      'Type de glace',
      'Méthode',
      'Garniture',
      'Ingrédients',
      'Date de création',
    ];

    const csvRows = cocktails.map((cocktail) => {
      const ingredientsList = cocktail.ingredients
        .map((ci) => {
          const qty = ci.quantity ? `${ci.quantity}${ci.unit || ''}` : '';
          return `${ci.ingredient.name}${qty ? ` (${qty})` : ''}`;
        })
        .join('; ');

      return [
        cocktail.id,
        cocktail.name,
        cocktail.type,
        cocktail.glass,
        cocktail.baseSpirit || '',
        cocktail.ice ? 'Oui' : 'Non',
        cocktail.iceType || '',
        cocktail.method.replace(/\n/g, ' '),
        cocktail.garnish || '',
        ingredientsList,
        new Date(cocktail.createdAt).toLocaleDateString('fr-FR'),
      ]
        .map((field) => `"${String(field).replace(/"/g, '""')}"`)
        .join(',');
    });

    const csv = [csvHeaders.join(','), ...csvRows].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="cocktails_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Erreur export cocktails:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
