'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAutoRefresh from '../../hooks/useAutoRefresh';

export default function AdminPage() {
  const router = useRouter();
  const [turnos, setTurnos] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    data: '',
    horario: '09:30',
    vagas: 10
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Configurar atualização automática dos dados
  const fetchAllData = async () => {
    await fetchTurnos();
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/turnos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: formData.data,
          horario: formData.horario,
          vagas_totais: parseInt(formData.vagas.toString()),
        }),
      });

      if (response.ok) {
        setMessage('Turno adicionado com sucesso!');
        setFormData({
          data: '',
          horario: '09:30',
          vagas: 10
        });
        fetchTurnos();
      } else {
        const error = await response.json();
        setMessage(`Erro: ${error.message || 'Falha ao adicionar turno'}`);
      }
    } catch (error) {
      setMessage('Erro ao conectar com o servidor');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este turno?')) return;
    
    try {
      const response = await fetch(`/api/turnos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Turno excluído com sucesso!');
        fetchTurnos();
      } else {
        const error = await response.json();
        setMessage(`Erro: ${error.message || 'Falha ao excluir turno'}`);
      }
    } catch (error) {
      setMessage('Erro ao conectar com o servidor');
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Administração de Escalas de Trabalho</h1>
      
      {message && (
        <div className={`p-4 mb-6 rounded-md ${message.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Adicionar Novo Turno</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data (DD/MM)</label>
              <input
                type="text"
                name="data"
                placeholder="DD/MM"
                pattern="[0-9]{2}/[0-9]{2}"
                value={formData.data}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Formato: DD/MM</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
              <select
                name="horario"
                value={formData.horario}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="09:30">09:30</option>
                <option value="13:30">13:30</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de Vagas</label>
              <input
                type="number"
                name="vagas"
                min="1"
                max="50"
                value={formData.vagas}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:bg-blue-400"
          >
            {isLoading ? 'Adicionando...' : 'Adicionar Turno'}
          </button>
        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Turnos Cadastrados</h2>
        
        {turnos.length === 0 ? (
          <p className="text-gray-500 italic">Nenhum turno cadastrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vagas Totais</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vagas Restantes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {turnos.map((turno) => (
                  <tr key={turno.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{turno.data}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{turno.horario}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{turno.vagas_totais}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{turno.vagas_restantes}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(turno.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
