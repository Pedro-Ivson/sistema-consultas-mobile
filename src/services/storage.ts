// Persistência local. O catálogo inicial vem de banco.json via data.ts.
// Cadastros e consultas criados em runtime ficam no AsyncStorage deste aparelho.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { ESPECIALIDADES, MEDICOS, USUARIOS_DEMO } from "../data/data";
import { Consulta } from "../interfaces/consulta";
import { Medico } from "../interfaces/medico";
import { Especialidade } from "../types/especialidade";
import { Usuario } from "../types/usuario";

const KEYS = {
  VERSAO: "@consultas:versao",
  ESPECIALIDADES: "@consultas:especialidades",
  MEDICOS: "@consultas:medicos",
  CONSULTAS: "@consultas:consultas",
  USUARIOS: "@consultas:usuarios",
  SESSAO: "@consultas:sessao",
};

const VERSAO_CATALOGO = "3";

export async function salvarEspecialidades(especialidades: Especialidade[]) {
  try {
    await AsyncStorage.setItem(
      KEYS.ESPECIALIDADES,
      JSON.stringify(especialidades)
    );
  } catch (erro) {
    console.error("Erro ao salvar especialidades:", erro);
  }
}

export async function obterEspecialidades(): Promise<Especialidade[]> {
  try {
    const dados = await AsyncStorage.getItem(KEYS.ESPECIALIDADES);
    return dados ? JSON.parse(dados) : [];
  } catch (erro) {
    console.error("Erro ao obter especialidades:", erro);
    return [];
  }
}

export async function salvarMedicos(medicos: Medico[]) {
  try {
    await AsyncStorage.setItem(KEYS.MEDICOS, JSON.stringify(medicos));
  } catch (erro) {
    console.error("Erro ao salvar médicos:", erro);
  }
}

export async function obterMedicos(): Promise<Medico[]> {
  try {
    const dados = await AsyncStorage.getItem(KEYS.MEDICOS);
    return dados ? JSON.parse(dados) : [];
  } catch (erro) {
    console.error("Erro ao obter médicos:", erro);
    return [];
  }
}

export async function salvarConsultas(consultas: Consulta[]) {
  try {
    await AsyncStorage.setItem(KEYS.CONSULTAS, JSON.stringify(consultas));
  } catch (erro) {
    console.error("Erro ao salvar consultas:", erro);
  }
}

export async function obterConsultas(): Promise<Consulta[]> {
  try {
    const dados = await AsyncStorage.getItem(KEYS.CONSULTAS);
    if (dados) {
      const consultas = JSON.parse(dados);
      return consultas.map((consulta: Consulta) => ({
        ...consulta,
        data: new Date(consulta.data),
      }));
    }
    return [];
  } catch (erro) {
    console.error("Erro ao obter consultas:", erro);
    return [];
  }
}

export async function salvarUsuarios(usuarios: Usuario[]) {
  try {
    await AsyncStorage.setItem(KEYS.USUARIOS, JSON.stringify(usuarios));
  } catch (erro) {
    console.error("Erro ao salvar usuários:", erro);
  }
}

export async function obterUsuarios(): Promise<Usuario[]> {
  try {
    const dados = await AsyncStorage.getItem(KEYS.USUARIOS);
    return dados ? JSON.parse(dados) : [];
  } catch (erro) {
    console.error("Erro ao obter usuários:", erro);
    return [];
  }
}

export async function salvarSessao(usuario: Usuario) {
  try {
    await AsyncStorage.setItem(KEYS.SESSAO, JSON.stringify(usuario));
  } catch (erro) {
    console.error("Erro ao salvar sessão:", erro);
  }
}

export async function obterSessao(): Promise<Usuario | null> {
  try {
    const dados = await AsyncStorage.getItem(KEYS.SESSAO);
    return dados ? JSON.parse(dados) : null;
  } catch (erro) {
    console.error("Erro ao obter sessão:", erro);
    return null;
  }
}

export async function limparSessao() {
  try {
    await AsyncStorage.removeItem(KEYS.SESSAO);
  } catch (erro) {
    console.error("Erro ao limpar sessão:", erro);
  }
}

function emailAtualizado(email: string): string {
  const normalizado = (email || "").trim().toLowerCase();
  return normalizado === "maria@clinica.com" ? "maria@email.com" : normalizado;
}

function completarLogin(usuario: Usuario): Usuario {
  const email = emailAtualizado(usuario.email);
  return {
    ...usuario,
    email,
    login: usuario.login?.trim().toLowerCase() || email.split("@")[0],
  };
}

function emailsDosMedicos(usuarios: Usuario[]): Map<number, string> {
  return new Map(
    usuarios
      .filter((usuario) => usuario.papel === "medico" && usuario.medicoId)
      .map((usuario) => [usuario.medicoId as number, emailAtualizado(usuario.email)])
  );
}

function mesclarMedicos(atuais: Medico[], usuarios: Usuario[]): Medico[] {
  const emailPorId = emailsDosMedicos(usuarios);
  const extras = atuais.filter(
    (medico) => !MEDICOS.some((item) => item.id === medico.id)
  );
  const catalogo = MEDICOS.map((mock) => {
    const jaSalvo = atuais.find((item) => item.id === mock.id);
    return {
      ...mock,
      email: jaSalvo?.email || emailPorId.get(mock.id) || mock.email,
    };
  });

  return [
    ...catalogo,
    ...extras.map((medico) => ({
      ...medico,
      email: medico.email || emailPorId.get(medico.id) || "",
    })),
  ];
}

function mesclarUsuarios(atuais: Usuario[]): Usuario[] {
  const atuaisComLogin = atuais.map(completarLogin);
  const emailsDemo = new Set(USUARIOS_DEMO.map((usuario) => usuario.email.toLowerCase()));
  const extras = atuaisComLogin.filter(
    (usuario) => !emailsDemo.has(usuario.email.toLowerCase())
  );
  return [...USUARIOS_DEMO, ...extras];
}

export async function semearDadosIniciais() {
  try {
    const versao = await AsyncStorage.getItem(KEYS.VERSAO);
    const medicosAtuais = await obterMedicos();
    const usuariosAtuais = await obterUsuarios();
    const medicos = mesclarMedicos(medicosAtuais, usuariosAtuais);
    const usuarios =
      usuariosAtuais.length === 0
        ? USUARIOS_DEMO
        : mesclarUsuarios(usuariosAtuais);

    await salvarEspecialidades(ESPECIALIDADES);
    await salvarMedicos(medicos);
    await salvarUsuarios(usuarios);
    await AsyncStorage.setItem(KEYS.VERSAO, VERSAO_CATALOGO);

    const sessao = await obterSessao();
    if (sessao) {
      await salvarSessao(completarLogin(sessao));
    }

    const consultas = await obterConsultas();
    const medicosPorId = new Map(medicos.map((medico) => [medico.id, medico]));
    const consultasAtualizadas = consultas.map((consulta) => ({
      ...consulta,
      paciente: {
        ...consulta.paciente,
        email: emailAtualizado(consulta.paciente.email),
      },
      medico: {
        ...consulta.medico,
        email:
          consulta.medico.email || medicosPorId.get(consulta.medico.id)?.email || "",
      },
    }));
    const precisaAtualizarConsultas =
      (versao !== VERSAO_CATALOGO && consultas.length > 0) ||
      consultas.some(
        (consulta, indice) =>
          consulta.paciente.email !==
            consultasAtualizadas[indice].paciente.email ||
          consulta.medico.email !== consultasAtualizadas[indice].medico.email
      );
    if (precisaAtualizarConsultas) {
      await salvarConsultas(consultasAtualizadas);
    }
  } catch (erro) {
    console.error("Erro ao semear dados iniciais:", erro);
  }
}
