import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Buscar todos os turnos ordenados por data e horário
    const { data: turnos, error } = await supabase
      .from('turnos')
      .select('*')
      .order('data')
      .order('horario');
    
    if (error) throw error;
    
    return NextResponse.json(turnos);
  } catch (error) {
    console.error('Erro ao buscar turnos:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar turnos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados recebidos
    const { data, horario, vagas_totais } = body;
    
    if (!data || !horario || !vagas_totais) {
      return NextResponse.json(
        { message: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Verificar formato da data (DD/MM)
    if (!/^\d{2}\/\d{2}$/.test(data)) {
      return NextResponse.json(
        { message: 'Formato de data inválido. Use DD/MM' },
        { status: 400 }
      );
    }

    // Verificar se o horário é válido (09:30 ou 13:30)
    if (horario !== '09:30' && horario !== '13:30') {
      return NextResponse.json(
        { message: 'Horário inválido. Use 09:30 ou 13:30' },
        { status: 400 }
      );
    }

    // Verificar se o turno já existe
    const { data: turnoExistente, error: errorCheck } = await supabase
      .from('turnos')
      .select('*')
      .eq('data', data)
      .eq('horario', horario)
      .maybeSingle();
    
    if (errorCheck) throw errorCheck;
    
    if (turnoExistente) {
      return NextResponse.json(
        { message: 'Turno já cadastrado para esta data e horário' },
        { status: 409 }
      );
    }

    // Criar novo turno
    const { data: novoTurno, error } = await supabase
      .from('turnos')
      .insert([
        {
          data,
          horario,
          vagas_totais: Number(vagas_totais),
          vagas_restantes: Number(vagas_totais)
        }
      ])
      .select()
      .single();
    
    if (error) throw error;

    return NextResponse.json(
      { message: 'Turno adicionado com sucesso', turno: novoTurno },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao adicionar turno:', error);
    return NextResponse.json(
      { message: 'Erro ao adicionar turno' },
      { status: 500 }
    );
  }
}