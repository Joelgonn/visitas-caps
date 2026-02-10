"use client";

import React, { useState, useEffect } from "react";
import { History, Search, ArrowLeft, Calendar, User, FileText } from "lucide-react";
import Link from "next/link";

export default function PaginaHistorico() {
  // Em um sistema real, isso viria do seu Banco de Dados (API)
  const [visitas, setVisitas] = useState([
    { id: 1, paciente: "João da Silva", visitante: "Ricardo Mello", doc: "123.456.789-00", data: "10/02/2025", hora: "14:30" },
    { id: 2, paciente: "Maria Oliveira", visitante: "Ana Paula", doc: "987.654.321-11", data: "10/02/2025", hora: "15:00" },
    { id: 3, paciente: "João da Silva", visitante: "Carla Dias", doc: "555.444.333-22", data: "09/02/2025", hora: "09:15" },
  ]);

  const [filtro, setFiltro] = useState("");

  const visitasFiltradas = visitas.filter(v => 
    v.paciente.toLowerCase().includes(filtro.toLowerCase()) || 
    v.visitante.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Cabeçalho com Voltar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition border">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <History className="text-blue-600" /> Histórico Geral de Visitas
            </h1>
          </div>
          <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border shadow-sm">
            Total: {visitas.length} registros
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Filtrar por paciente ou visitante..."
              className="w-full pl-10 p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-600">
            <Calendar size={18} /> Data
          </button>
        </div>

        {/* Lista de Visitas */}
        <div className="grid gap-4">
          {visitasFiltradas.map((v) => (
            <div key={v.id} className="bg-white p-4 rounded-xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between hover:border-blue-200 transition">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-full text-blue-600 hidden sm:block">
                  <User size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{v.visitante}</span>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase font-semibold">Documento: {v.doc}</span>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <FileText size={14} className="text-gray-400" /> 
                    Visitou: <span className="font-semibold text-blue-700">{v.paciente}</span>
                  </p>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 text-right border-t md:border-0 pt-2 md:pt-0">
                <p className="text-sm font-bold text-gray-800">{v.hora}</p>
                <p className="text-xs text-gray-400">{v.data}</p>
              </div>
            </div>
          ))}

          {visitasFiltradas.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed text-gray-400">
              Nenhum registro encontrado para essa busca.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}