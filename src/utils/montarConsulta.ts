import { Consulta } from "../interfaces/consulta";
import { Medico } from "../interfaces/medico";
import { Paciente } from "../types/paciente";
import { Usuario } from "../types/usuario";

export function montarPacienteDaSessao(usuario: Usuario): Paciente {
  return {
    id: usuario.id,
    nome: usuario.nome,
    cpf: usuario.cpf ?? "não informado",
    email: usuario.email,
    telefone: usuario.telefone,
  };
}

export function montarConsulta(entrada: {
  medico: Medico;
  usuario: Usuario;
  data: Date;
}): Consulta {
  return {
    id: Date.now(),
    medico: entrada.medico,
    paciente: montarPacienteDaSessao(entrada.usuario),
    data: entrada.data,
    valor: 350,
    status: "agendada",
    observacoes: `Agendada pelo app (${entrada.medico.especialidade.nome})`,
  };
}
