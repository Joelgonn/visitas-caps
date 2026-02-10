"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

// ADICIONE ESTA FUNÇÃO NOVAMENTE PARA O BUILD PASSAR
export async function criarUsuarioMestre() {
  try {
    const emailMestre = "admin@hospital.com";
    const existe = await prisma.usuario.findUnique({ where: { email: emailMestre } });
    if (existe) return { success: true, message: "Usuário mestre já existe!" };

    const senhaCripto = await bcrypt.hash("admin123", 10);
    await prisma.usuario.create({
      data: { nome: "Admin", email: emailMestre, senha: senhaCripto, cargo: "admin" }
    });
    return { success: true, message: "Usuário criado!" };
  } catch (e) {
    return { success: false, message: "Erro ao criar." };
  }
}

/** --- SEÇÃO: PACIENTES --- **/

// Busca apenas pacientes que ainda estão internados
export async function getPacientesInternados() {
  return await prisma.paciente.findMany({
    where: { situacao: "Internado" },
    orderBy: { nome: 'asc' },
  });
}

// Registra uma nova internação
export async function internarPaciente(nome: string, quarto: string, leito: string) {
  const novo = await prisma.paciente.create({
    data: { nome, quarto, leito, situacao: "Internado" }
  });
  revalidatePath("/dashboard");
  return novo;
}

// Dar alta ao paciente (muda status para não aparecer mais na busca de visitas)
export async function darAltaPaciente(id: number) {
  await prisma.paciente.update({
    where: { id },
    data: { situacao: "Alta" }
  });
  revalidatePath("/dashboard");
}

/** --- SEÇÃO: VISITAS --- **/

export async function registrarVisita(pacienteId: number, nome: string, doc: string) {
  await prisma.visita.create({
    data: {
      pacienteId,
      visitanteNome: nome,
      visitanteDoc: doc
    }
  });
  revalidatePath("/dashboard");
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

export async function cadastrarUsuario(nome: string, email: string, senhaPura: string, cargo: string) {
  const senhaCripto = await bcrypt.hash(senhaPura, 10);
  await prisma.usuario.create({
    data: { nome, email, senha: senhaCripto, cargo }
  });
  revalidatePath("/dashboard/usuarios");
  return { success: true };
}