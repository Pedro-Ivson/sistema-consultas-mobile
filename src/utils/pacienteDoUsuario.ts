// Aula 01/10/2026
// Consulta guarda um Paciente; o perfil vem do Usuario do catálogo.

import { Paciente } from "../types/paciente";
import { Usuario } from "../types/usuario";

export function pacienteDoUsuario(usuario: Usuario): Paciente {
  return {
    id: usuario.id,
    nome: usuario.nome,
    cpf: usuario.cpf ?? "não informado",
    email: usuario.email,
    telefone: usuario.telefone,
  };
}
