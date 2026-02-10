"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

interface ActionResponse {
  success: boolean;
  error?: string | null;
  data?: any;
}

/** --- SEÇÃO: SEGURANÇA (LOGIN/LOGOUT) --- **/

export async function autenticarUsuario(email: string, senhaDigitada: string) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) return { success: false, error: "Usuário não encontrado" };
  
  const senhaValida = await bcrypt.compare(senhaDigitada, usuario.senha);
  if (!senhaValida) return { success: false, error: "Senha incorreta" };

  const cookieStore = await cookies();
  cookieStore.set("usuario_session", usuario.email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 dia
    path: "/",
  });

  return { success: true };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("usuario_session");
}

/** --- SEÇÃO: ESTATÍSTICAS E BUSCA (NOVO) --- **/

export async function getDashboardStats() {
  const [internados, visitasHoje] = await Promise.all([
    prisma.paciente.count({ where: { situacao: "Internado" } }),
    prisma.visita.count({
      where: {
        dataHora: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }
    })
  ]);
  return { internados, visitasHoje };
}

export async function buscarVisitantePorDoc(doc: string) {
  const ultimaVisita = await prisma.visita.findFirst({
    where: { visitanteDoc: doc },
    orderBy: { dataHora: 'desc' },
    select: { visitanteNome: true }
  });
  return ultimaVisita;
}

/** --- SEÇÃO: PACIENTES E VISITAS --- **/

export async function getPacientesInternados() {
  return await prisma.paciente.findMany({
    where: { situacao: "Internado" },
    orderBy: { nome: 'asc' },
  });
}

export async function internarPaciente(nome: string, quarto: string, leito: string): Promise<ActionResponse> {
  try {
    const novo = await prisma.paciente.create({ data: { nome, quarto, leito, situacao: "Internado" } });
    revalidatePath("/dashboard");
    return { success: true, data: novo };
  } catch (e) { return { success: false, error: "Erro ao internar." }; }
}

export async function darAltaPaciente(id: number): Promise<ActionResponse> {
  try {
    await prisma.paciente.update({ where: { id }, data: { situacao: "Alta" } });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) { return { success: false, error: "Erro ao dar alta." }; }
}

export async function registrarVisita(pacienteId: number, nome: string, doc: string): Promise<ActionResponse> {
  try {
    await prisma.visita.create({ data: { pacienteId, visitanteNome: nome, visitanteDoc: doc } });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) { return { success: false, error: "Erro ao registrar visita." }; }
}

export async function getVisitasRecentes() {
  return await prisma.visita.findMany({
    include: { paciente: true },
    orderBy: { dataHora: 'desc' },
    take: 10
  });
}

// Funções de Gerenciamento de Usuários
export async function getUsuarios() {
  return await prisma.usuario.findMany({ select: { id: true, nome: true, email: true, cargo: true }, orderBy: { nome: 'asc' } });
}

export async function cadastrarUsuario(nome: string, email: string, senhaPura: string, cargo: string): Promise<ActionResponse> {
  try {
    const senhaCripto = await bcrypt.hash(senhaPura, 10);
    await prisma.usuario.create({ data: { nome, email, senha: senhaCripto, cargo } });
    revalidatePath("/dashboard/usuarios");
    return { success: true, error: null };
  } catch (error) { return { success: false, error: "Erro ao cadastrar." }; }
}