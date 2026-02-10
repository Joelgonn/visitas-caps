"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, ArrowRight, Mail, Key, AlertCircle, Loader2 } from "lucide-react";
import { autenticarUsuario } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    try {
      const resultado = await autenticarUsuario(email, senha);
      if (resultado.success) {
        router.push("/dashboard");
      } else {
        setErro(resultado.error || "Acesso negado.");
        setLoading(false);
      }
    } catch (err) {
      setErro("Erro de conexão.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Portal de Acesso</h1>
          <p className="text-slate-400 text-sm font-medium">Controle de Visitas Hospitalar</p>
        </div>

        {erro && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-center gap-3 text-red-700 animate-in fade-in">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-xs font-bold uppercase tracking-tight">{erro}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="E-mail Corporativo"
            />
            <Mail className="absolute left-4 top-4 text-slate-300" size={20} />
          </div>
          
          <div className="relative">
            <input required type="password" value={senha} onChange={e => setSenha(e.target.value)}
              className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Senha de Acesso"
            />
            <Key className="absolute left-4 top-4 text-slate-300" size={20} />
          </div>

          <button disabled={loading} type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg flex justify-center items-center gap-2 mt-8 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>ACESSAR SISTEMA <ArrowRight size={20} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}