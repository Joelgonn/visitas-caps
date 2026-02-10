"use client";

import React, { useState, useEffect } from "react";
import { Search, User, ClipboardList, CheckCircle, ArrowLeft, History, LogOut, Plus, X, Loader2, Users, UserMinus } from "lucide-react";
import Link from "next/link";
import { getPacientesInternados, internarPaciente, registrarVisita, getVisitasRecentes, darAltaPaciente } from "../actions";

export default function Dashboard() {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [visitas, setVisitas] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [pacienteSelecionado, setPacienteSelecionado] = useState<any | null>(null);
  const [visitanteNome, setVisitanteNome] = useState("");
  const [visitanteDoc, setVisitanteDoc] = useState("");
  const [modalInternar, setModalInternar] = useState(false);
  const [novoPaciente, setNovoPaciente] = useState({ nome: "", quarto: "", leito: "" });
  const [status, setStatus] = useState<"ocioso" | "enviando" | "sucesso">("ocioso");

  useEffect(() => {
    fetchData();
  }, [status]);

  async function fetchData() {
    const [p, v] = await Promise.all([getPacientesInternados(), getVisitasRecentes()]);
    setPacientes(p);
    setVisitas(v);
    setCarregando(false);
  }

  const pacientesFiltrados = pacientes.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()));

  async function handleAlta(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm("Confirmar alta deste paciente? ele não constará mais na lista de visitas.")) {
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
      setVisitanteNome(""); setVisitanteDoc(""); setBusca("");
    }, 2000);
  }

  if (carregando) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Profissional */}
        <header className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white"><ClipboardList /></div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tighter">Hospital Visitas</h1>
              <div className="flex gap-4 mt-1">
                <Link href="/dashboard/usuarios" className="text-[10px] font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1 uppercase transition">
                  <Users size={12} /> Gerenciar Equipe
                </Link>
                <Link href="/dashboard/historico" className="text-[10px] font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1 uppercase transition">
                  <History size={12} /> Histórico Completo
                </Link>
              </div>
            </div>
          </div>
          <Link href="/" className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition"><LogOut /></Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Coluna Busca */}
          <section className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black uppercase text-slate-400 text-xs tracking-widest">Pacientes Internados</h2>
              <button onClick={() => setModalInternar(true)} className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition"><Plus size={18} /></button>
            </div>
            
            <input 
              disabled={!!pacienteSelecionado}
              placeholder="🔍 Nome do paciente..." 
              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl mb-4 outline-none focus:ring-2 focus:ring-blue-500"
              value={busca} onChange={e => setBusca(e.target.value)}
            />

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {!pacienteSelecionado && pacientesFiltrados.map(p => (
                <div key={p.id} onClick={() => setPacienteSelecionado(p)} className="p-4 bg-white border border-slate-100 rounded-xl cursor-pointer hover:border-blue-500 transition group flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800">{p.nome}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Quarto {p.quarto} • Leito {p.leito}</p>
                  </div>
                  <button onClick={(e) => handleAlta(p.id, e)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition" title="Dar Alta">
                    <UserMinus size={18} />
                  </button>
                </div>
              ))}
            </div>

            {pacienteSelecionado && (
              <div className="bg-blue-600 p-6 rounded-2xl text-white animate-in zoom-in duration-200 shadow-lg shadow-blue-200">
                <div className="flex justify-between mb-4">
                  <span className="text-[10px] font-black uppercase opacity-60">Selecionado</span>
                  <button onClick={() => setPacienteSelecionado(null)}><X size={18} /></button>
                </div>
                <p className="text-xl font-black leading-tight">{pacienteSelecionado.nome}</p>
                <p className="text-sm opacity-80">Localização: {pacienteSelecionado.quarto} - {pacienteSelecionado.leito}</p>
              </div>
            )}
          </section>

          {/* Coluna Registro */}
          <section className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            {status === "sucesso" && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center animate-in fade-in">
                <CheckCircle size={60} className="text-green-500 mb-2 animate-bounce" />
                <h3 className="text-xl font-black uppercase">Entrada Liberada</h3>
              </div>
            )}
            
            <h2 className="font-black uppercase text-slate-400 text-xs tracking-widest mb-6">Registro de Visitante</h2>
            
            {!pacienteSelecionado ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-200 border-2 border-dashed rounded-3xl">
                <User size={48} className="opacity-20" />
                <p className="text-xs font-bold uppercase mt-2">Aguardando seleção de paciente</p>
              </div>
            ) : (
              <form onSubmit={handleVisita} className="space-y-4">
                <input required placeholder="Nome do Visitante" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={visitanteNome} onChange={e => setVisitanteNome(e.target.value)} />
                <input required placeholder="Documento (CPF/RG)" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={visitanteDoc} onChange={e => setVisitanteDoc(e.target.value)} />
                <button type="submit" disabled={status === "enviando"} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-100 uppercase tracking-tighter flex justify-center items-center gap-2">
                  {status === "enviando" ? <Loader2 className="animate-spin" /> : "Confirmar Acesso"}
                </button>
              </form>
            )}
          </section>

          {/* Tabela de Histórico */}
          <section className="lg:col-span-12 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 font-black text-[10px] text-slate-400 uppercase tracking-widest">Últimas Visitas</div>
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-slate-50">
                {visitas.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50 transition text-slate-600">
                    <td className="px-6 py-4 font-bold text-slate-900">{v.visitanteNome}</td>
                    <td className="px-6 py-4 text-xs uppercase font-bold text-slate-400">Visitou: {v.paciente.nome}</td>
                    <td className="px-6 py-4 text-xs font-mono">{new Date(v.dataHora).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>

      {/* Modal Internar */}
      {modalInternar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center font-black uppercase tracking-tighter">
              <h3>Nova Internação</h3>
              <button onClick={() => setModalInternar(false)}><X /></button>
            </div>
            <form onSubmit={handleInternar} className="p-6 space-y-4">
              <input required placeholder="Nome do Paciente" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" value={novoPaciente.nome} onChange={e => setNovoPaciente({...novoPaciente, nome: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Quarto" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" value={novoPaciente.quarto} onChange={e => setNovoPaciente({...novoPaciente, quarto: e.target.value})} />
                <input required placeholder="Leito" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" value={novoPaciente.leito} onChange={e => setNovoPaciente({...novoPaciente, leito: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl uppercase">Salvar no Banco Neon</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}