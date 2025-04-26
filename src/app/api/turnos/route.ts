import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = await readDB();

    // Buscar todos os turnos ordenados por data e horário
    const results = db.turnos.sort((a, b) => {
      // Ordenar por data primeiro
      if (a.data !== b.data) {
        return a.data.localeCompare(b.data);
      }
      // Se a data for a mesma, ordenar por horário
      return a.horario.localeCompare(b.horario);
    });

    return NextResponse.json(results);
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
    const db = await readDB();
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
    const turnoExistente = db.turnos.find(
      turno => turno.data === data && turno.horario === horario
    );

    if (turnoExistente) {
      return NextResponse.json(
        { message: 'Turno já cadastrado para esta data e horário' },
        { status: 409 }
      );
    }

    // Gerar ID para o novo turno
    const novoId = db.turnos.length > 0 
      ? Math.max(...db.turnos.map(t => t.id)) + 1 
      : 1;

    // Criar novo turno
    const novoTurno = {
      id: novoId,
      data,
      horario,
      vagas_totais: Number(vagas_totais),
      vagas_restantes: Number(vagas_totais),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Adicionar turno ao banco de dados
    db.turnos.push(novoTurno);
    await writeDB(db);

    return NextResponse.json(
      { message: 'Turno adicionado com sucesso' },
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