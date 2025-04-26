import { NextRequest, NextResponse } from 'next/server';
import { readDB } from '../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = await readDB();

    // Buscar todos os usuários ordenados por nome
    const results = db.usuarios.sort((a, b) => a.nome.localeCompare(b.nome));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar usuários' },
      { status: 500 }
    );
  }
}
