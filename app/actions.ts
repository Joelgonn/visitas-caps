"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

// Interface padrão para retornos das ações
interface ActionResponse {
  success: boolean;
  error?: string | null;
  data?: any;
}

/** --- SEÇÃO: PACIENTES --- **/

export async function getPacientesInternados() {
  return await prisma.paciente.findMany({
    where: { situacao: "Internado" },
    orderBy: { nome: 'asc' },
  });
}

export async function internarPaciente(nome: string, quarto: string, leito: string): Promise<ActionResponse> {
  try {
    const novo = await prisma.paciente.create({
      data: { nome, quarto, leito, situacao: "Internado" }
    });
    revalidatePath("/dashboard");
    return { success: true, data: novo };
  } catch (e) {
    return { success: false, error: "Erro ao internar paciente." };
  }
}

export async function darAltaPaciente(id: number): Promise<ActionResponse> {
  try {
    await prisma.paciente.update({
      where: { id },
      data: { situacao: "Alta" }
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Erro ao dar alta." };
  }
}

/** --- SEÇÃO: VISITAS --- **/

export async function registrarVisita(pacienteId: number, nome: string, doc: string): Promise<ActionResponse> {
  try {
    await prisma.visita.create({
      data: { pacienteId, visitanteNome: nome, visitanteDoc: doc }
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Erro ao registrar visita." };
  }
}

export async function getVisitasRecentes() {
  return await prisma.visita.findMany({
    include: { paciente: true },
    orderBy: { dataHora: 'desc' },
    take: 10
  });
}

/** --- SEÇÃO: USUÁRIOS --- **/

export async function autenticarUsuario(email: string, senhaDigitada: string) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) return { success: false, error: "Usuário não encontrado" };
  
  const senhaValida = await bcrypt.compare(senhaDigitada, usuario.senha);
  if (!senhaValida) return { success: false, error: "Senha incorreta" };

  return { success: true, user: { nome: usuario.nome, cargo: usuario.cargo } };
}

export async function getUsuarios() {
  return await prisma.usuario.findMany({
    select: { id: true, nome: true, email: true, cargo: true },
    orderBy: { nome: 'asc' }
  });
}

export async function cadastrarUsuario(nome: string, email: string, senhaPura: string, cargo: string): Promise<ActionResponse> {
  try {
    const senhaCripto = await bcrypt.hash(senhaPura, 10);
    await prisma.usuario.create({
      data: { nome, email, senha: senhaCripto, cargo }
    });
    revalidatePath("/dashboard/usuarios");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: "E-mail já cadastrado ou erro no servidor." };
  }
}

// Mantida apenas para compatibilidade de build, se necessário
export async function criarUsuarioMestre(): Promise<ActionResponse> {
  try {
    const emailMestre = "admin@hospital.com";
    const existe = await prisma.usuario.findUnique({ where: { email: emailMestre } });
    if (existe) return { success: true, error: null };
    const senhaCripto = await bcrypt.hash("admin123", 10);
    await prisma.usuario.create({
      data: { nome: "Admin", email: emailMestre, senha: senhaCripto, cargo: "admin" }
    });
    return { success: true, error: null };
  } catch (e) {
    return { success: false, error: "Erro no setup." };
  }
}