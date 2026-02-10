"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { criarUsuarioMestre } from "./actions"; // Importe a ação

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Função temporária para o seu setup
  const handleSetup = async () => {
    const res = await criarUsuarioMestre();
    alert(res.message);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { router.push("/dashboard"); }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Acesso Restrito</h1>
          <p className="text-gray-500 text-sm">Controle de Visitas Hospitalar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* ... campos de email e senha ... */}
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg">
            Entrar no Sistema
          </button>
        </form>

        {/* BOTÃO DE SETUP - USE UMA VEZ E DEPOIS DELETE ESTE BLOCO */}
        <div className="mt-8 pt-6 border-t border-dashed border-gray-200 text-center">
          <button 
            onClick={handleSetup}
            className="text-[10px] text-gray-400 hover:text-blue-600 flex items-center gap-1 mx-auto uppercase font-bold tracking-widest"
          >
            <ShieldCheck size={12} /> Inicializar Banco de Dados (Mestre)
          </button>
        </div>
      </div>
    </div>
  );
}