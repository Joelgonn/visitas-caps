"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

/**
 * --- SEÇÃO: PACIENTES ---
 */

// Busca todos os pacientes internados
export async function getPacientes() {
  try {
    return await prisma.paciente.findMany({
      where: { situacao: "Internado" },
      orderBy: { nome: 'asc' },
    });
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error);
    return [];
  }
}

// Registra uma nova internação
export async function internarPaciente(nome: string, quarto: string, leito: string) {
  try {
    const novo = await prisma.paciente.create({
      data: { 
        nome, 
        quarto, 
        leito, 
        situacao: "Internado" 
      }
    });
    
    revalidatePath("/dashboard");
    return { success: true, data: novo };
  } catch (error) {
    console.error("Erro ao internar:", error);
    return { success: false, error: "Falha ao registrar internação" };
  }
}


/**
 * --- SEÇÃO: VISITAS ---
 */

// Registra uma nova visita no banco
export async function registrarVisita(pacienteId: number, nome: string, doc: string) {
  try {
    await prisma.visita.create({
      data: {
        pacienteId,
        visitanteNome: nome,
        visitanteDoc: doc
      }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erro ao registrar visita:", error);
    return { success: false, error: "Falha ao salvar visita" };
  }
}

// Busca as últimas 20 visitas com os dados do paciente (Join)
export async function getVisitasRecentes() {
  try {
    return await prisma.visita.findMany({
      include: { 
        paciente: true // Traz os dados do paciente junto
      },
      orderBy: { 
        dataHora: 'desc' 
      },
      take: 20
    });
  } catch (error) {
    console.error("Erro ao buscar visitas:", error);
    return [];
  }
}


/**
 * --- SEÇÃO: SEGURANÇA E USUÁRIOS ---
 */

// Função de Setup: Cria o usuário mestre para login
export async function criarUsuarioMestre() {
  const emailMestre = "admin@hospital.com";
  const senhaPadrao = "admin123";

  try {
    // 1. Verifica se já existe um admin
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: emailMestre }
    });

    if (usuarioExistente) {
      return { success: false, message: "Usuário mestre já existe no banco!" };
    }

    // 2. Criptografa a senha antes de salvar
    const saltRounds = 10;
    const senhaCriptografada = await bcrypt.hash(senhaPadrao, saltRounds);

    // 3. Cria o usuário
    await prisma.usuario.create({
      data: {
        nome: "Administrador do Sistema",
        email: emailMestre,
        senha: senhaCriptografada,
        cargo: "admin"
      }
    });

    return { 
      success: true, 
      message: `Usuário mestre criado! E-mail: ${emailMestre} | Senha: ${senhaPadrao}` 
    };

  } catch (error) {
    console.error("Erro ao criar usuário mestre:", error);
    return { success: false, message: "Erro crítico ao criar usuário." };
  }
}

// Função para validar login (Será usada no formulário de login futuramente)
export async function autenticarUsuario(email: string, senhaDigitada: string) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario) return { success: false, error: "Usuário não encontrado" };

    // Compara a senha digitada com o Hash do banco
    const senhaValida = await bcrypt.compare(senhaDigitada, usuario.senha);

    if (!senhaValida) return { success: false, error: "Senha incorreta" };

    return { 
      success: true, 
      user: { id: usuario.id, nome: usuario.nome, cargo: usuario.cargo } 
    };

  } catch (error) {
    return { success: false, error: "Erro na autenticação" };
  }
}