-- Migration number: 0001 	 2025-04-26
-- Sistema de Escala de Trabalho - Esquema Inicial

-- Remover tabelas existentes se necessário
DROP TABLE IF EXISTS turnos;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS inscricoes;

-- Tabela de turnos disponíveis
CREATE TABLE IF NOT EXISTS turnos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data TEXT NOT NULL,           -- Data no formato DD/MM
  horario TEXT NOT NULL,        -- Horário no formato HH:MM
  vagas_totais INTEGER NOT NULL, -- Número total de vagas disponíveis
  vagas_restantes INTEGER NOT NULL, -- Número de vagas ainda disponíveis
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de usuários que podem se inscrever nos turnos
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT UNIQUE NOT NULL,    -- Nome do usuário
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de inscrições dos usuários nos turnos
CREATE TABLE IF NOT EXISTS inscricoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  turno_id INTEGER NOT NULL,    -- ID do turno escolhido
  usuario_id INTEGER NOT NULL,  -- ID do usuário inscrito
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (turno_id) REFERENCES turnos(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  UNIQUE(turno_id, usuario_id)  -- Impede que um usuário se inscreva mais de uma vez no mesmo turno
);

-- Dados iniciais para usuários (exemplo)
INSERT INTO usuarios (nome) VALUES 
  ('Ana Silva'),
  ('Bruno Santos'),
  ('Carlos Oliveira'),
  ('Daniela Lima'),
  ('Eduardo Pereira'),
  ('Fernanda Costa'),
  ('Gabriel Souza'),
  ('Helena Martins'),
  ('Igor Almeida'),
  ('Juliana Ferreira');

-- Índices para melhorar a performance
CREATE INDEX idx_turnos_data_horario ON turnos(data, horario);
CREATE INDEX idx_inscricoes_turno_id ON inscricoes(turno_id);
CREATE INDEX idx_inscricoes_usuario_id ON inscricoes(usuario_id);
