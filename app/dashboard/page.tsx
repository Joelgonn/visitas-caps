"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, User, ClipboardList, CheckCircle, ArrowLeft, 
  History, LogOut, Plus, X, Loader2, Users, UserMinus, 
  Activity, UsersRound 
} from "lucide-react";
import Link from "next/link";
import { 
  getPacientesInternados, internarPaciente, registrarVisita, 
  getVisitasRecentes, darAltaPaciente, logout, getDashboardStats, buscarVisitantePorDoc 
} from "../actions";

export default function Dashboard() {
  // --- Estados do Banco de Dados ---
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [visitas, setVisitas] = useState<any[]>([]);
  const [stats, setStats] = useState({ internados: 0, visitasHoje: 0 });
  const [carregando, setCarregando] = useState(true);
  
  // --- Estados de Controle de UI ---
  const [busca, setBusca] = useState("");
  const [pacienteSelecionado, setPacienteSelecionado] = useState<any | null>(null);
  const [visitanteNome, setVisitanteNome] = useState("");
  const [visitanteDoc, setVisitanteDoc] = useState("");
  const [modalInternar, setModalInternar] = useState(false);
  const [novoPaciente, setNovoPaciente] = useState({ nome: "", quarto: "", leito: "" });
  const [status, setStatus] = useState<"ocioso" | "enviando" | "sucesso">("ocioso");

  // --- Carregar Dados ---
  useEffect(() => {
    fetchData();
  }, [status]);

  async function fetchData() {
    try {
      const [p, v, s] = await Promise.all([
        getPacientesInternados(), 
        getVisitasRecentes(),
        getDashboardStats()
      ]);
      setPacientes(p);
      setVisitas(v);
      setStats(s);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setCarregando(false);
    }
  }

  // --- Filtros e Buscas ---
  const pacientesFiltrados = pacientes.filter(p => 
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  async function handleBuscaVisitante(doc: string) {
    setVisitanteDoc(doc);
    if (doc.length >= 5) {
      const jaVeio = await buscarVisitantePorDoc(doc);
      if (jaVeio) setVisitanteNome(jaVeio.visitanteNome);
    }
  }

  // --- Ações de Formulário ---
  async function handleAlta(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm("Confirmar alta deste paciente? Ele deixará de aparecer na lista de visitas.")) {
      await darAltaPaciente(id);
      fetchData();
    }
  }

  async function handleInternar(e: React.FormEvent) {
    e.preventDefault();
    setStatus("enviando");
    await internarPaciente(novoPaciente.nome, novoPaciente.quarto, novoPaciente.leito);
    setModalInternar(false);
    setNovoPaciente({ nome: "", quarto: "", leito: "" });
    setStatus("ocioso");
  }

  async function handleVisita(e: React.FormEvent) {
    e.preventDefault();
    setStatus("enviando");
    await registrarVisita(pacienteSelecionado.id, visitanteNome, visitanteDoc);
    setStatus("sucesso");
    setTimeout(() => {
      setStatus("ocioso");
      setPacienteSelecionado(null);
      setVisitanteNome("");
      setVisitanteDoc("");
      setBusca("");
    }, 2000);
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Superior */}
        <header className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-100">
              <ClipboardList size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tighter leading-none">Visitas Caps III</h1>
              <div className="flex gap-4 mt-1">
                <Link href="/dashboard/usuarios" className="text-[10px] font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1 uppercase transition">
                  <Users size={12} /> Gerenciar Equipe
                </Link>
              </div>
            </div>
          </div>
          <button 
            onClick={async () => { await logout(); window.location.href="/"; }} 
            className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition flex items-center gap-2 font-bold text-sm"
          >
            <span className="hidden sm:inline">Sair</span>
            <LogOut size={20} />
          </button>
        </header>

        {/* Estatísticas do Topo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-blue-200 transition">
              <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><Activity /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internados</p>
                <p className="text-2xl font-black">{stats.internados}</p>
              </div>
           </div>
           <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-green-200 transition">
              <div className="bg-green-50 p-3 rounded-2xl text-green-600"><UsersRound /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visitas Hoje</p>
                <p className="text-2xl font-black">{stats.visitasHoje}</p>
              </div>
           </div>
        </div>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Coluna de Pacientes */}
          <section className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black uppercase text-slate-400 text-xs tracking-widest">Pacientes</h2>
              <button onClick={() => setModalInternar(true)} className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition shadow-md shadow-green-100">
                <Plus size={18} />
              </button>
            </div>
            
            <div className="relative mb-4">
              <input 
                disabled={!!pacienteSelecionado}
                placeholder="Pesquisar por nome..." 
                className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={busca} 
                onChange={e => setBusca(e.target.value)}
              />
              <Search className="absolute left-4 top-4 text-slate-300" size={20} />
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {!pacienteSelecionado && pacientesFiltrados.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => setPacienteSelecionado(p)} 
                  className="p-4 bg-white border border-slate-100 rounded-xl cursor-pointer hover:border-blue-500 transition group flex justify-between items-center shadow-sm"
                >
                  <div>
                    <p className="font-bold text-slate-800">{p.nome}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Quarto {p.quarto} • Leito {p.leito}</p>
                  </div>
                  <button 
                    onClick={(e) => handleAlta(p.id, e)} 
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition"
                  >
                    <UserMinus size={18} />
                  </button>
                </div>
              ))}
              {!pacienteSelecionado && busca && pacientesFiltrados.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-10">Nenhum paciente encontrado.</p>
              )}
            </div>

            {pacienteSelecionado && (
              <div className="bg-blue-600 p-6 rounded-2xl text-white animate-in zoom-in duration-200 shadow-xl shadow-blue-100">
                <div className="flex justify-between mb-4">
                  <span className="text-[10px] font-black uppercase opacity-60">Selecionado</span>
                  <button onClick={() => setPacienteSelecionado(null)} className="hover:bg-blue-500 p-1 rounded-md transition"><X size={18} /></button>
                </div>
                <p className="text-xl font-black leading-tight">{pacienteSelecionado.nome}</p>
                <p className="text-xs opacity-80 mt-1 uppercase font-bold tracking-widest">Local: {pacienteSelecionado.quarto} - {pacienteSelecionado.leito}</p>
              </div>
            )}
          </section>

          {/* Coluna de Registro de Visita */}
          <section className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden h-fit">
            {status === "sucesso" && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center animate-in fade-in">
                <div className="bg-green-100 p-4 rounded-full mb-4"><CheckCircle size={60} className="text-green-500 animate-bounce" /></div>
                <h3 className="text-xl font-black uppercase tracking-tighter">Entrada Liberada</h3>
              </div>
            )}
            
            <h2 className="font-black uppercase text-slate-400 text-xs tracking-widest mb-6">Nova Visita</h2>
            
            {!pacienteSelecionado ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-200 border-2 border-dashed border-slate-50 rounded-3xl">
                <User size={48} className="opacity-10 mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest">Aguardando seleção de paciente</p>
              </div>
            ) : (
              <form onSubmit={handleVisita} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Documento (CPF/RG)</label>
                  <input 
                    required 
                    placeholder="Ao digitar o CPF, o nome pode auto-preencher" 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition" 
                    value={visitanteDoc} 
                    onChange={e => handleBuscaVisitante(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nome Completo</label>
                  <input 
                    required 
                    placeholder="Nome do Visitante" 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition" 
                    value={visitanteNome} 
                    onChange={e => setVisitanteNome(e.target.value)} 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={status === "enviando"} 
                  className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-lg shadow-blue-100 uppercase tracking-tighter flex justify-center items-center gap-2 transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {status === "enviando" ? <Loader2 className="animate-spin" /> : <><CheckCircle size={20} /> Registrar Entrada</>}
                </button>
              </form>
            )}
          </section>

          {/* Histórico Recente */}
          <section className="lg:col-span-12 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <History size={16} className="text-slate-400" />
              <h2 className="font-black text-[10px] text-slate-400 uppercase tracking-widest">Últimas Visitas no Neon</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-slate-50">
                  {visitas.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50 transition text-slate-600">
                      <td className="px-6 py-4 font-bold text-slate-900">{v.visitanteNome}</td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black uppercase bg-blue-50 text-blue-600 px-2 py-1 rounded-md">Visitou: {v.paciente.nome}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">
                        {new Date(v.dataHora).toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                  {visitas.length === 0 && (
                    <tr><td colSpan={3} className="text-center py-10 text-slate-300 italic">Nenhuma visita registrada recentemente.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {/* Modal Internar */}
      {modalInternar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center shadow-lg">
              <div>
                <h3 className="font-black text-xl leading-none uppercase tracking-tighter">Nova Visita</h3>
                <p className="text-[10px] uppercase opacity-60 font-bold mt-1">Salvar registro no banco</p>
              </div>
              <button onClick={() => setModalInternar(false)} className="hover:bg-white/20 p-2 rounded-full transition"><X /></button>
            </div>
            <form onSubmit={handleInternar} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nome Completo</label>
                <input required autoFocus placeholder="Nome do Paciente" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500" value={novoPaciente.nome} onChange={e => setNovoPaciente({...novoPaciente, nome: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Quarto</label>
                  <input required placeholder="Ex: 204" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500" value={novoPaciente.quarto} onChange={e => setNovoPaciente({...novoPaciente, quarto: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Leito</label>
                  <input required placeholder="Ex: A" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500" value={novoPaciente.leito} onChange={e => setNovoPaciente({...novoPaciente, leito: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl uppercase tracking-tighter shadow-lg shadow-blue-100 transition hover:bg-blue-700">
                Confirmar Visita
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}