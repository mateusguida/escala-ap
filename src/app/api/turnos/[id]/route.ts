import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Verificar se há inscrições para este turno
    const { data: inscricoes, error: errorInscricoes } = await supabase
      .from('inscricoes')
      .select('*')
      .eq('turno_id', id);
    
    if (errorInscricoes) throw errorInscricoes;
    
    if (inscricoes && inscricoes.length > 0) {
      return NextResponse.json(
        { message: 'Não é possível excluir um turno com inscrições' },
        { status: 400 }
      );
    }

    // Excluir o turno
    const { error } = await supabase
      .from('turnos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;

    return NextResponse.json(
      { message: 'Turno excluído com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir turno:', error);
    return NextResponse.json(
      { message: 'Erro ao excluir turno' },
      { status: 500 }
    );
  }
}
