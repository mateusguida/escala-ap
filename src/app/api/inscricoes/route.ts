import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Simulação de banco de dados usando arquivo JSON para desenvolvimento local
const DB_FILE = path.join(process.cwd(), 'db.json');

// Função para ler o banco de dados
async function readDB() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Se o arquivo não existir, criar um banco de dados vazio
    const initialDB = { turnos: [], usuarios: [], inscricoes: [] };
    await fs.writeFile(DB_FILE, JSON.stringify(initialDB, null, 2));
    return initialDB;
  }
}

// Função para salvar no banco de dados
async function writeDB(data: any) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

export async function GET(request: NextRequest) {
  try {
    const db = await readDB();

    // Buscar todas as inscrições com nome do usuário
    const results = db.inscricoes.map(inscricao => {
      const usuario = db.usuarios.find(u => u.id === inscricao.usuario_id);
      return {
        ...inscricao,
        usuario_nome: usuario ? usuario.nome : 'Usuário não encontrado'
      };
    }).sort((a, b) => {
      // Ordenar por turno_id e depois por nome de usuário
      if (a.turno_id === b.turno_id) {
        return a.usuario_nome.localeCompare(b.usuario_nome);
      }
      return a.turno_id - b.turno_id;
    });

    return NextResponse.json(results);
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
    const db = await readDB();
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
    const turno = db.turnos.find(t => t.id === turno_id);
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
    const usuario = db.usuarios.find(u => u.id === usuario_id);
    if (!usuario) {
      return NextResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o usuário já está inscrito neste turno
    const inscricaoExistente = db.inscricoes.find(
      i => i.turno_id === turno_id && i.usuario_id === usuario_id
    );

    if (inscricaoExistente) {
      return NextResponse.json(
        { message: 'Usuário já inscrito neste turno' },
        { status: 409 }
      );
    }

    // Gerar ID para a nova inscrição
    const novoId = db.inscricoes.length > 0 
      ? Math.max(...db.inscricoes.map(i => i.id)) + 1 
      : 1;

    // Criar nova inscrição
    const novaInscricao = {
      id: novoId,
      turno_id,
      usuario_id,
      created_at: new Date().toISOString()
    };

    // Atualizar vagas restantes no turno
    const turnoIndex = db.turnos.findIndex(t => t.id === turno_id);
    db.turnos[turnoIndex].vagas_restantes -= 1;
    db.turnos[turnoIndex].updated_at = new Date().toISOString();

    // Adicionar inscrição ao banco de dados
    db.inscricoes.push(novaInscricao);
    await writeDB(db);

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
