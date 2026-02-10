"use client";

import React, { useState, useEffect } from "react";
import { Search, User, ClipboardList, CheckCircle, ArrowLeft, History, LogOut, Plus, X, BedDouble, Loader2 } from "lucide-react";
import Link from "next/link";
import { getPacientes, internarPaciente, registrarVisita, getVisitasRecentes } from "../actions";

export default function Dashboard() {
  // --- Estados ---
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [visitas, setVisitas] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  const [busca, setBusca] = useState("");
  const [pacienteSelecionado, setPacienteSelecionado] = useState<any | null>(null);
  
  const [visitanteNome, setVisitanteNome] = useState("");
  const [visitanteDoc, setVisitanteDoc] = useState("");
  
  const [modalAberto, setModalAberto] = useState(false);
  const [novoPaciente, setNovoPaciente] = useState({ nome: "", quarto: "", leito: "" });
  
  const [statusAcao, setStatusAcao] = useState<"ocioso" | "enviando" | "sucesso">("ocioso");

  // --- Carregamento Inicial ---
  useEffect(() => {
    async function fetchData() {
      try {
        const [listaPacientes, listaVisitas] = await Promise.all([
          getPacientes(),
          getVisitasRecentes()
        ]);
        setPacientes(listaPacientes);
        setVisitas(listaVisitas);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setCarregando(false);
      }
    }
    fetchData();
  }, [statusAcao]);

  // --- Filtro de Busca ---
  const pacientesFiltrados = pacientes.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  // --- Ação: Internar Paciente ---
  const handleInternar = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusAcao("enviando");
    try {
      const criado = await internarPaciente(novoPaciente.nome, novoPaciente.quarto, novoPaciente.leito);
      setPacienteSelecionado(criado);
      setModalAberto(false);
      setNovoPaciente({ nome: "", quarto: "", leito: "" });
      setStatusAcao("ocioso");
    } catch (e) { setStatusAcao("ocioso"); }
  };

  // --- Ação: Registrar Visita ---
  const handleVisita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteSelecionado) return;
    setStatusAcao("enviando");
    try {
      await registrarVisita(pacienteSelecionado.id, visitanteNome, visitanteDoc);
      setStatusAcao("sucesso");
      
      setTimeout(() => {
        setStatusAcao("ocioso");
        setPacienteSelecionado(null);
        setVisitanteNome("");
        setVisitanteDoc("");
        setBusca("");
      }, 2000);
    } catch (e) { setStatusAcao("ocioso"); }
  };

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <ClipboardList size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-none">Hospital Control</h1>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Recepção</p>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-2 text-sm text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition font-medium">
            <LogOut size={16} /> Sair
          </Link>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Lado Esquerdo: Busca */}
          <section className="lg:col-span-5 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-gray-700 flex items-center gap-2">
                <Search size={18} className="text-blue-500" /> Pacientes
              </h2>
              <button 
                onClick={() => setModalAberto(true)}
                className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 transition shadow-sm"
              >
                <Plus size={14} /> Internar
              </button>
            </div>

            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Pesquisar paciente..."
                className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                disabled={!!pacienteSelecionado}
              />
              <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
            </div>

            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {!pacienteSelecionado && pacientesFiltrados.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setPacienteSelecionado(p)}
                  className="p-3 bg-white border border-gray-100 rounded-xl cursor-pointer hover:border-blue-400 hover:shadow-md transition group"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-gray-800 group-hover:text-blue-600">{p.nome}</p>
                    <span className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded-md font-bold uppercase">Internado</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Quarto {p.quarto} • Leito {p.leito}</p>
                </div>
              ))}
              {!pacienteSelecionado && busca && pacientesFiltrados.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-10 italic">Nenhum paciente encontrado.</p>
              )}
            </div>

            {pacienteSelecionado && (
              <div className="bg-blue-600 p-4 rounded-xl text-white shadow-lg animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black uppercase opacity-60">Paciente Selecionado</span>
                  <button onClick={() => setPacienteSelecionado(null)} className="bg-blue-500 hover:bg-blue-400 p-1 rounded-md transition">
                    <X size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-full"><User size={28} /></div>
                  <div>
                    <p className="text-lg font-bold leading-tight">{pacienteSelecionado.nome}</p>
                    <p className="text-xs opacity-80">Quarto {pacienteSelecionado.quarto} • Leito {pacienteSelecionado.leito}</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Lado Direito: Registro */}
          <section className="lg:col-span-7 bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
            {statusAcao === "sucesso" && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center animate-in fade-in">
                <div className="bg-green-100 p-4 rounded-full mb-4 animate-bounce">
                  <CheckCircle size={64} className="text-green-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Acesso Liberado!</h3>
                <p className="text-gray-500">O registro foi salvo no banco de dados.</p>
              </div>
            )}

            <h2 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
              <User size={20} className="text-blue-500" /> Registrar Visitante
            </h2>

            {!pacienteSelecionado ? (
              <div className="h-[300px] border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-300">
                <User size={48} className="mb-2 opacity-20" />
                <p className="text-sm font-medium">Selecione um paciente para liberar o formulário</p>
              </div>
            ) : (
              <form onSubmit={handleVisita} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Nome do Visitante</label>
                    <input required type="text" value={visitanteNome} onChange={(e) => setVisitanteNome(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Nome Completo" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Documento (RG ou CPF)</label>
                    <input required type="text" value={visitanteDoc} onChange={(e) => setVisitanteDoc(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="000.000.000-00" />
                  </div>
                </div>
                <button 
                  disabled={statusAcao === "enviando"}
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-blue-200 shadow-lg transition flex justify-center items-center gap-2 uppercase tracking-tighter"
                >
                  {statusAcao === "enviando" ? <Loader2 className="animate-spin" /> : <><CheckCircle size={20} /> Confirmar Entrada</>}
                </button>
              </form>
            )}
          </section>

          {/* Tabela de Histórico Real */}
          <section className="lg:col-span-12 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
              <h2 className="text-sm font-black text-gray-500 uppercase flex items-center gap-2">
                <History size={16} /> Últimos Registros no Neon
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white border-b text-gray-400 text-[10px] uppercase font-black">
                  <tr>
                    <th className="px-6 py-4">Data / Hora</th>
                    <th className="px-6 py-4">Visitante</th>
                    <th className="px-6 py-4">Documento</th>
                    <th className="px-6 py-4">Paciente Visitado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visitas.map((v) => (
                    <tr key={v.id} className="hover:bg-blue-50/30 transition">
                      <td className="px-6 py-4 font-mono text-xs text-gray-400">{new Date(v.dataHora).toLocaleString("pt-BR")}</td>
                      <td className="px-6 py-4 font-bold text-gray-800">{v.visitanteNome}</td>
                      <td className="px-6 py-4 text-gray-500">{v.visitanteDoc}</td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">{v.paciente.nome}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {visitas.length === 0 && <p className="text-center py-10 text-gray-300 italic">Nenhuma visita registrada no banco.</p>}
            </div>
          </section>
        </main>
      </div>

      {/* Modal Internação */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-xl leading-none uppercase tracking-tighter">Nova Internação</h3>
                <p className="text-xs opacity-70 mt-1">Cadastrar paciente no banco de dados</p>
              </div>
              <button onClick={() => setModalAberto(false)} className="hover:bg-white/20 p-2 rounded-full transition"><X /></button>
            </div>
            <form onSubmit={handleInternar} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nome Completo</label>
                <input required autoFocus type="text" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" value={novoPaciente.nome} onChange={(e) => setNovoPaciente({...novoPaciente, nome: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Quarto</label>
                  <input required type="text" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" value={novoPaciente.quarto} onChange={(e) => setNovoPaciente({...novoPaciente, quarto: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Leito</label>
                  <input required type="text" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" value={novoPaciente.leito} onChange={(e) => setNovoPaciente({...novoPaciente, leito: e.target.value})} />
                </div>
              </div>
              <button type="submit" disabled={statusAcao === "enviando"} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg transition flex justify-center items-center gap-2 uppercase tracking-tighter">
                {statusAcao === "enviando" ? <Loader2 className="animate-spin" /> : "Confirmar e Internar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}