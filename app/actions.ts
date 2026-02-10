"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPacientes() {
  return await prisma.paciente.findMany({
    orderBy: { nome: 'asc' },
  });
}

export async function internarPaciente(nome: string, quarto: string, leito: string) {
  const novo = await prisma.paciente.create({
    data: { nome, quarto, leito, situacao: "Internado" }
  });
  revalidatePath("/dashboard");
  return novo;
}

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