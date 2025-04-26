import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Buscar todas as inscrições com nome do usuário
    const { data: inscricoes, error } = await supabase
      .from('inscricoes')
      .select(`
        *,
        usuarios (id, nome)
      `);
    
    if (error) throw error;
    
    // Formatar os dados para o formato esperado pelo frontend
    const formattedInscricoes = inscricoes.map(inscricao => ({
      id: inscricao.id,
      turno_id: inscricao.turno_id,
      usuario_id: inscricao.usuario_id,
      created_at: inscricao.created_at,
      usuario_nome: inscricao.usuarios ? inscricao.usuarios.nome : 'Usuário não encontrado'
    }));
    
    return NextResponse.json(formattedInscricoes);
  } catch (error) {
    console.error('Erro ao buscar inscrições:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar inscrições' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados recebidos
    const { turno_id, usuario_id } = body;
    
    if (!turno_id || !usuario_id) {
      return NextResponse.json(
        { message: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Verificar se o turno existe e tem vagas disponíveis
    const { data: turno, error: errorTurno } = await supabase
      .from('turnos')
      .select('*')
      .eq('id', turno_id)
      .maybeSingle();
    
    if (errorTurno) throw errorTurno;
    
    if (!turno) {
      return NextResponse.json(
        { message: 'Turno não encontrado' },
        { status: 404 }
      );
    }

    if (turno.vagas_restantes <= 0) {
      return NextResponse.json(
        { message: 'Não há vagas disponíveis para este turno' },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe
    const { data: usuario, error: errorUsuario } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', usuario_id)
      .maybeSingle();
    
    if (errorUsuario) throw errorUsuario;
    
    if (!usuario) {
      return NextResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o usuário já está inscrito neste turno
    const { data: inscricaoExistente, error: errorInscricao } = await supabase
      .from('inscricoes')
      .select('*')
      .eq('turno_id', turno_id)
      .eq('usuario_id', usuario_id)
      .maybeSingle();
    
    if (errorInscricao) throw errorInscricao;
    
    if (inscricaoExistente) {
      return NextResponse.json(
        { message: 'Usuário já inscrito neste turno' },
        { status: 409 }
      );
    }

    // Iniciar uma transação para garantir consistência dos dados
    // Como o Supabase não suporta transações diretamente via API, vamos fazer manualmente

    // 1. Criar nova inscrição
    const { data: novaInscricao, error: errorNovaInscricao } = await supabase
      .from('inscricoes')
      .insert([
        {
          turno_id,
          usuario_id
        }
      ])
      .select()
      .single();
    
    if (errorNovaInscricao) throw errorNovaInscricao;

    // 2. Atualizar vagas restantes no turno
    const { error: errorUpdateTurno } = await supabase
      .from('turnos')
      .update({
        vagas_restantes: turno.vagas_restantes - 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', turno_id);
    
    if (errorUpdateTurno) {
      // Se houver erro ao atualizar o turno, tentar remover a inscrição
      await supabase
        .from('inscricoes')
        .delete()
        .eq('id', novaInscricao.id);
      
      throw errorUpdateTurno;
    }

    return NextResponse.json(
      { message: 'Inscrição realizada com sucesso' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao realizar inscrição:', error);
    return NextResponse.json(
      { message: 'Erro ao realizar inscrição' },
      { status: 500 }
    );
  }
}
