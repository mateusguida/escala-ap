'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Sistema de Escala de Trabalho</h1>
        
        <div className="space-y-6">
          <Link 
            href="/admin" 
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md text-center transition duration-200"
          >
            Área do Administrador
          </Link>
          
          <Link 
            href="/inscricao" 
            className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md text-center transition duration-200"
          >
            Inscrição em Turnos
          </Link>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Sistema para gerenciamento de escalas de trabalho</p>
          <p className="mt-1">Escolha uma das opções acima para continuar</p>
        </div>
      </div>
    </div>
  );
}
