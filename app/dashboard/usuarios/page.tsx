"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, Shield, Mail, ArrowLeft, Loader2, CheckCircle, X } from "lucide-react";
import Link from "next/link";
import { getUsuarios, cadastrarUsuario } from "../../actions";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  
  // Estados do formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cargo, setCargo] = useState("recepcionista");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    const dados = await getUsuarios();
    setUsuarios(dados);
    setLoading(false);
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    const res = await cadastrarUsuario(nome, email, senha, cargo);
    if (res.success) {
      await carregarUsuarios();
      setModalAberto(false);
      setNome(""); setEmail(""); setSenha("");
    } else {
      alert(res.error);
    }
    setEnviando(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-100 transition">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Equipe e Acessos</h1>
          </div>
          <button 
            onClick={() => setModalAberto(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm transition shadow-lg shadow-blue-100"
          >
            <UserPlus size={18} /> Novo Usuário
          </button>
        </header>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : (
          <div className="grid gap-4">
            {usuarios.map(u => (
              <div key={u.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 p-3 rounded-full text-slate-500">
                    <Shield size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{u.nome}</p>
                    <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${u.cargo === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                  {u.cargo}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Novo Usuário */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
              <h3 className="font-black text-xl leading-none uppercase tracking-tighter">Cadastrar Acesso</h3>
              <button onClick={() => setModalAberto(false)}><X /></button>
            </div>
            <form onSubmit={handleSalvar} className="p-6 space-y-4">
              <input required placeholder="Nome Completo" className="w-full p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={nome} onChange={e => setNome(e.target.value)} />
              <input required type="email" placeholder="E-mail" className="w-full p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={e => setEmail(e.target.value)} />
              <input required type="password" placeholder="Senha Temporária" className="w-full p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={senha} onChange={e => setSenha(e.target.value)} />
              <select className="w-full p-4 bg-slate-50 rounded-xl outline-none" value={cargo} onChange={e => setCargo(e.target.value)}>
                <option value="recepcionista">Recepcionista</option>
                <option value="admin">Administrador</option>
              </select>
              <button disabled={enviando} className="w-full bg-blue-600 text-white font-black py-4 rounded-xl flex justify-center items-center gap-2 uppercase tracking-tighter">
                {enviando ? <Loader2 className="animate-spin" /> : <><CheckCircle size={18} /> Confirmar Cadastro</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}