import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '../../../../lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await readDB();
    const id = parseInt(params.id);

    // Verificar se o turno existe
    const turnoIndex = db.turnos.findIndex(turno => turno.id === id);
    if (turnoIndex === -1) {
      return NextResponse.json(
        { message: 'Turno não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se há inscrições para este turno
    const inscricoesParaTurno = db.inscricoes.filter(inscricao => inscricao.turno_id === id);
    if (inscricoesParaTurno.length > 0) {
      return NextResponse.json(
        { message: 'Não é possível excluir um turno com inscrições' },
        { status: 400 }
      );
    }

    // Excluir o turno
    db.turnos.splice(turnoIndex, 1);
    await writeDB(db);

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
