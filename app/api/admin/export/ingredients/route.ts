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

    const ingredients = await prisma.ingredient.findMany({
      include: {
        stock: true,
        barAvailability: true,
      },
      orderBy: { name: 'asc' },
    });

    const csvHeaders = [
      'ID',
      'Nom',
      'Catégorie',
      'Sous-catégorie',
      'Alcoolisé',
      'Alcool de base',
      'Coût unitaire',
      'Unité de coût',
      'Stock actuel',
      'Unité de stock',
      'Disponible au bar',
      'Date de création',
    ];

    const csvRows = ingredients.map((ingredient) => {
      return [
        ingredient.id,
        ingredient.name,
        ingredient.category,
        ingredient.subcategory || '',
        ingredient.isAlcoholic ? 'Oui' : 'Non',
        ingredient.baseSpirit || '',
        ingredient.costPerUnit ? Number(ingredient.costPerUnit).toFixed(2) : '',
        ingredient.costUnit || '',
        ingredient.stock ? Number(ingredient.stock.quantity).toFixed(2) : '',
        ingredient.stock?.unit || '',
        ingredient.barAvailability?.available ? 'Oui' : 'Non',
        new Date(ingredient.createdAt).toLocaleDateString('fr-FR'),
      ]
        .map((field) => `"${String(field).replace(/"/g, '""')}"`)
        .join(',');
    });

    const csv = [csvHeaders.join(','), ...csvRows].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="ingredients_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Erreur export ingrédients:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
