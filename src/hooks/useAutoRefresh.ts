'use client';

import { useState, useEffect } from 'react';

export default function useAutoRefresh(fetchFunction: () => Promise<void>, intervalMs: number = 5000) {
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    if (!isEnabled) return;

    // Executar a função de busca imediatamente
    fetchFunction();

    // Configurar o intervalo para atualizações periódicas
    const intervalId = setInterval(() => {
      fetchFunction();
    }, intervalMs);

    // Limpar o intervalo quando o componente for desmontado
    return () => clearInterval(intervalId);
  }, [fetchFunction, intervalMs, isEnabled]);

  return {
    isEnabled,
    setIsEnabled,
  };
}
