import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Type de fichier non autorisé' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 5MB)' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const filepath = join(uploadsDir, filename);

    await writeFile(filepath, buffer);

    const imageUrl = `/uploads/${filename}`;

    return NextResponse.json({ imageUrl }, { status: 201 });
  } catch (error) {
    console.error('Erreur upload fichier:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
