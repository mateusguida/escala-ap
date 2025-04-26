import { promises as fs } from 'fs';
import path from 'path';

// Caminho para o arquivo JSON que servirá como banco de dados
const DB_FILE = path.join(process.cwd(), 'db.json');

// Estrutura do banco de dados
interface Usuario {
  id: number;
  nome: string;
  created_at: string;
}

interface Turno {
  id: number;
  data: string;
  horario: string;
  vagas_totais: number;
  vagas_restantes: number;
  created_at: string;
  updated_at: string;
}

interface Inscricao {
  id: number;
  turno_id: number;
  usuario_id: number;
  created_at: string;
}

interface DB {
  turnos: Turno[];
  usuarios: Usuario[];
  inscricoes: Inscricao[];
}

// Função para ler o banco de dados
export async function readDB(): Promise<DB> {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Se o arquivo não existir, criar um banco de dados vazio com usuários iniciais
    const initialDB: DB = { 
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
    await writeDB(initialDB);
    return initialDB;
  }
}

// Função para salvar no banco de dados
export async function writeDB(data: DB): Promise<void> {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}