'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAutoRefresh from '../../hooks/useAutoRefresh';

interface Turno {
  id: number;
  data: string;
  horario: string;
  vagas_totais: number;
  vagas_restantes: number;
}

interface Usuario {
  id: number;
  nome: string;
}

interface Inscricao {
  id: number;
  turno_id: number;
  usuario_id: number;
  usuario_nome: string;
}

export default function InscricaoPage() {
  const router = useRouter();
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [turnoSelecionado, setTurnoSelecionado] = useState<number | null>(null);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Configurar atualização automática dos dados
  const fetchAllData = async () => {
    await Promise.all([
      fetchTurnos(),
      fetchUsuarios(),
      fetchInscricoes()
    ]);
  };

  // Usar o hook de atualização automática
  const { isEnabled, setIsEnabled } = useAutoRefresh(fetchAllData, 3000);

  const fetchTurnos = async () => {
    try {
      const response = await fetch('/api/turnos');
      if (response.ok) {
        const data = await response.json();
        setTurnos(data);
      }
    } catch (error) {
      console.error('Erro ao carregar turnos:', error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await fetch('/api/usuarios');
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const fetchInscricoes = async () => {
    try {
      const response = await fetch('/api/inscricoes');
      if (response.ok) {
        const data = await response.json();
        setInscricoes(data);
      }
    } catch (error) {
      console.error('Erro ao carregar inscrições:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (!turnoSelecionado || !usuarioSelecionado) {
      setMessage('Por favor, selecione um turno e um usuário');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/inscricoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          turno_id: turnoSelecionado,
          usuario_id: usuarioSelecionado,
        }),
      });

      if (response.ok) {
        setMessage('Inscrição realizada com sucesso!');
        setTurnoSelecionado(null);
        setUsuarioSelecionado(null);
        // Atualizar dados
        fetchTurnos();
        fetchInscricoes();
      } else {
        const error = await response.json();
        setMessage(`Erro: ${error.message || 'Falha ao realizar inscrição'}`);
      }
    } catch (error) {
      setMessage('Erro ao conectar com o servidor');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar inscrições por turno
  const getInscricoesPorTurno = (turnoId: number) => {
    return inscricoes.filter(inscricao => inscricao.turno_id === turnoId);
  };

  // Verificar se um turno está cheio
  const isTurnoCheio = (turno: Turno) => {
    return turno.vagas_restantes <= 0;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Inscrição em Escalas de Trabalho</h1>
      
      {message && (
        <div className={`p-4 mb-6 rounded-md ${message.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Realizar Nova Inscrição</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selecione seu Nome</label>
              <select
                value={usuarioSelecionado || ''}
                onChange={(e) => setUsuarioSelecionado(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Selecione um nome</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nome}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selecione o Turno</label>
              <select
                value={turnoSelecionado || ''}
                onChange={(e) => setTurnoSelecionado(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Selecione um turno</option>
                {turnos.map((turno) => (
                  <option 
                    key={turno.id} 
                    value={turno.id}
                    disabled={isTurnoCheio(turno)}
                  >
                    {turno.data} - {turno.horario} - {turno.vagas_restantes} vagas disponíveis
                    {isTurnoCheio(turno) ? ' (ESGOTADO)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !turnoSelecionado || !usuarioSelecionado || (turnoSelecionado && isTurnoCheio(turnos.find(t => t.id === turnoSelecionado)!))}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:bg-gray-400"
          >
            {isLoading ? 'Processando...' : 'Confirmar Inscrição'}
          </button>
        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Turnos Disponíveis</h2>
        
        {turnos.length === 0 ? (
          <p className="text-gray-500 italic">Nenhum turno disponível.</p>
        ) : (
          <div className="space-y-6">
            {turnos.map((turno) => {
              const inscricoesTurno = getInscricoesPorTurno(turno.id);
              return (
                <div key={turno.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">
                      {turno.data} - {turno.horario}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isTurnoCheio(turno) 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {turno.vagas_restantes} / {turno.vagas_totais} vagas
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Pessoas Inscritas:</h4>
                    {inscricoesTurno.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">Nenhuma inscrição</p>
                    ) : (
                      <ul className="text-sm text-gray-600 pl-4">
                        {inscricoesTurno.map((inscricao) => (
                          <li key={inscricao.id}>{inscricao.usuario_nome}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="mt-6 text-center">
        <button
          onClick={() => router.push('/')}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Voltar para a página inicial
        </button>
      </div>
    </div>
  );
}
