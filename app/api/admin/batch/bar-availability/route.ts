import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { ingredientIds, available } = body;

    if (!Array.isArray(ingredientIds) || ingredientIds.length === 0) {
      return NextResponse.json({ error: 'IDs invalides' }, { status: 400 });
    }

    const results = await Promise.all(
      ingredientIds.map(async (ingredientId) => {
        const existing = await prisma.barAvailability.findUnique({
          where: { ingredientId },
        });

        if (existing) {
          return prisma.barAvailability.update({
            where: { ingredientId },
            data: { available },
          });
        } else {
          return prisma.barAvailability.create({
            data: {
              ingredientId,
              available,
            },
          });
        }
      })
    );

    await createAuditLog({
      action: 'bar_availability_updated',
      userId: session.user.id,
      userEmail: session.user.email || undefined,
      userName: session.user.name || undefined,
      entityType: 'bar_availability',
      details: `Mise à jour en lot: ${ingredientIds.length} ingrédients => ${available ? 'disponible' : 'indisponible'}`,
    });

    return NextResponse.json({
      success: true,
      updated: results.length,
    });
  } catch (error) {
    console.error('Erreur batch update:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
