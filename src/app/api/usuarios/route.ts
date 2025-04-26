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
    // Se o arquivo não existir, criar um banco de dados vazio com usuários iniciais
    const initialDB = { 
      turnos: [], 
      usuarios: [
        { id: 1, nome: 'Ana Silva', created_at: new Date().toISOString() },
        { id: 2, nome: 'Bruno Santos', created_at: new Date().toISOString() },
        { id: 3, nome: 'Carlos Oliveira', created_at: new Date().toISOString() },
        { id: 4, nome: 'Daniela Lima', created_at: new Date().toISOString() },
        { id: 5, nome: 'Eduardo Pereira', created_at: new Date().toISOString() },
        { id: 6, nome: 'Fernanda Costa', created_at: new Date().toISOString() },
        { id: 7, nome: 'Gabriel Souza', created_at: new Date().toISOString() },
        { id: 8, nome: 'Helena Martins', created_at: new Date().toISOString() },
        { id: 9, nome: 'Igor Almeida', created_at: new Date().toISOString() },
        { id: 10, nome: 'Juliana Ferreira', created_at: new Date().toISOString() }
      ], 
      inscricoes: [] 
    };
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
