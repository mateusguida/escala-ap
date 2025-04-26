import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Buscar todos os usuários ordenados por nome
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('nome');
    
    if (error) throw error;
    
    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar usuários' },
      { status: 500 }
    );
  }
}
