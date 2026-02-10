"use client";

import React, { useState } from "react";
import { Search, User, ClipboardList, CheckCircle, ArrowLeft, History, LogOut, Plus, X, BedDouble } from "lucide-react";
import Link from "next/link";

// --- Tipos de Dados ---
type Paciente = {
  id: number;
  nome: string;
  quarto: string;
  leito: string;
  situacao: "Internado" | "Alta";
};

type Visita = {
  id: number;
  pacienteId: number;
  pacienteNome: string;
  visitanteNome: string;
  visitanteDoc: string;
  dataHora: string;
};

// --- Dados Iniciais ---
const DADOS_INICIAIS: Paciente[] = [
  { id: 1, nome: "João da Silva", quarto: "101", leito: "A", situacao: "Internado" },
  { id: 2, nome: "Maria Oliveira", quarto: "102", leito: "B", situacao: "Internado" },
];

export default function Dashboard() {
  // --- Estados do Sistema ---
  // Agora 'pacientes' é um estado, permitindo adicionar novos!
  const [pacientes, setPacientes] = useState<Paciente[]>(DADOS_INICIAIS);
  const [visitas, setVisitas] = useState<Visita[]>([]);
  
  // Controle da Busca e Seleção
  const [busca, setBusca] = useState("");
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);
  
  // Controle do Formulário de Visita
  const [visitanteNome, setVisitanteNome] = useState("");
  const [visitanteDoc, setVisitanteDoc] = useState("");
  const [sucesso, setSucesso] = useState(false);

  // Controle do Modal de Novo Paciente
  const [modalAberto, setModalAberto] = useState(false);
  const [novoPaciente, setNovoPaciente] = useState({ nome: "", quarto: "", leito: "" });

  // Filtragem (busca)
  const pacientesFiltrados = pacientes.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  // --- Função: Registrar Visita ---
  const handleRegistrarVisita = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteSelecionado) return;

    const novaVisita: Visita = {
      id: Date.now(),
      pacienteId: pacienteSelecionado.id,
      pacienteNome: pacienteSelecionado.nome,
      visitanteNome,
      visitanteDoc,
      dataHora: new Date().toLocaleString("pt-BR"),
    };

    setVisitas([novaVisita, ...visitas]);
    setSucesso(true);
    
    setTimeout(() => {
      setSucesso(false);
      setVisitanteNome("");
      setVisitanteDoc("");
      setPacienteSelecionado(null);
      setBusca("");
    }, 2000);
  };

  // --- Função: Adicionar Novo Paciente (Internação) ---
  const handleInternarPaciente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoPaciente.nome || !novoPaciente.quarto) return;

    const novoRegistro: Paciente = {
      id: Date.now(), // Gera um ID único baseado no tempo
      nome: novoPaciente.nome,
      quarto: novoPaciente.quarto,
      leito: novoPaciente.leito,
      situacao: "Internado"
    };

    // Adiciona ao topo da lista
    setPacientes([novoRegistro, ...pacientes]);
    
    // Limpa e fecha modal
    setNovoPaciente({ nome: "", quarto: "", leito: "" });
    setModalAberto(false);
    
    // Opcional: Já seleciona o paciente recém criado
    setPacienteSelecionado(novoRegistro);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-gray-800 relative">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Cabeçalho */}
        <header className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <ClipboardList size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Hospital System</h1>
              <p className="text-xs text-gray-500">Recepção & Triagem</p>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition">
            <LogOut size={16} /> Sair
          </Link>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* COLUNA ESQUERDA: Busca e Lista */}
          <section className="lg:col-span-5 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit flex flex-col gap-4">
            
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-700">
                <Search size={20} className="text-blue-500" />
                Pacientes
              </h2>
              {/* Botão para abrir Modal */}
              <button 
                onClick={() => setModalAberto(true)}
                className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 transition"
              >
                <Plus size={14} /> Nova Internação
              </button>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nome..."
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                disabled={!!pacienteSelecionado}
              />
              <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {!pacienteSelecionado && pacientesFiltrados.length === 0 && (
                 <div className="text-center py-8 text-gray-400">
                   <p className="text-sm">Nenhum paciente encontrado.</p>
                   {busca.length > 0 && (
                     <button onClick={() => setModalAberto(true)} className="text-blue-600 text-sm hover:underline mt-2">
                       Cadastrar "{busca}"?
                     </button>
                   )}
                 </div>
              )}
              
              {!pacienteSelecionado && pacientesFiltrados.map((paciente) => (
                <div
                  key={paciente.id}
                  onClick={() => paciente.situacao === "Internado" && setPacienteSelecionado(paciente)}
                  className={`p-3 rounded-lg border cursor-pointer transition flex justify-between items-center text-sm
                    ${paciente.situacao === "Alta" 
                      ? "bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed" 
                      : "bg-white border-gray-200 hover:border-blue-500 hover:bg-blue-50"
                    }`}
                >
                  <div>
                    <p className="font-bold text-gray-800">{paciente.nome}</p>
                    <p className="text-xs text-gray-500">Q: {paciente.quarto} • L: {paciente.leito}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${paciente.situacao === "Internado" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {paciente.situacao}
                  </span>
                </div>
              ))}
            </div>

            {/* Card Selecionado */}
            {pacienteSelecionado && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg animate-in fade-in zoom-in">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-blue-600 uppercase">Paciente Selecionado</span>
                  <button onClick={() => setPacienteSelecionado(null)} className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 bg-white px-2 py-1 rounded border border-blue-100">
                    <ArrowLeft size={12} /> Voltar
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-full text-blue-600 shadow-sm">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{pacienteSelecionado.nome}</p>
                    <p className="text-sm text-gray-600">Quarto {pacienteSelecionado.quarto} • Leito {pacienteSelecionado.leito}</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* COLUNA DIREITA: Formulário Visita */}
          <section className="lg:col-span-7 bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden h-fit">
            {sucesso && (
              <div className="absolute inset-0 bg-green-50/95 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-in fade-in">
                <CheckCircle size={48} className="text-green-500 mb-2" />
                <h3 className="text-2xl font-bold text-green-700">Visita Liberada!</h3>
              </div>
            )}

            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-slate-700">
              <User size={20} className="text-blue-500" />
              Registro de Visitante
            </h2>

            {!pacienteSelecionado ? (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50">
                <p>Selecione um paciente ao lado</p>
              </div>
            ) : (
              <form onSubmit={handleRegistrarVisita} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Visitante</label>
                  <input required type="text" value={visitanteNome} onChange={(e) => setVisitanteNome(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nome completo" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Documento</label>
                  <input required type="text" value={visitanteDoc} onChange={(e) => setVisitanteDoc(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="RG ou CPF" />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg flex justify-center items-center gap-2">
                  <CheckCircle size={20} /> Liberar Acesso
                </button>
              </form>
            )}
          </section>
          
          {/* Histórico */}
          {visitas.length > 0 && (
            <section className="lg:col-span-12 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
               <h2 className="text-sm font-bold uppercase text-gray-500 mb-4 flex items-center gap-2"><History size={16} /> Histórico Recente</h2>
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left text-gray-500">
                   <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                     <tr><th className="px-4 py-3">Hora</th><th className="px-4 py-3">Visitante</th><th className="px-4 py-3">Paciente</th></tr>
                   </thead>
                   <tbody>
                     {visitas.map((v) => (
                       <tr key={v.id} className="border-b"><td className="px-4 py-3">{v.dataHora}</td><td className="px-4 py-3 font-bold text-gray-900">{v.visitanteNome}</td><td className="px-4 py-3">{v.pacienteNome}</td></tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </section>
          )}
        </main>
      </div>

      {/* --- MODAL DE INTERNAÇÃO --- */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2 text-gray-800">
                <BedDouble size={20} className="text-green-600" /> Nova Internação
              </h3>
              <button onClick={() => setModalAberto(false)} className="text-gray-400 hover:text-red-500 transition">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleInternarPaciente} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Paciente</label>
                <input 
                  required autoFocus
                  type="text" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="Nome completo do paciente"
                  value={novoPaciente.nome}
                  onChange={(e) => setNovoPaciente({...novoPaciente, nome: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quarto</label>
                  <input 
                    required
                    type="text" 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Ex: 204"
                    value={novoPaciente.quarto}
                    onChange={(e) => setNovoPaciente({...novoPaciente, quarto: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Leito</label>
                  <input 
                    required
                    type="text" 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Ex: A"
                    value={novoPaciente.leito}
                    onChange={(e) => setNovoPaciente({...novoPaciente, leito: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md transition">
                  Confirmar Internação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}