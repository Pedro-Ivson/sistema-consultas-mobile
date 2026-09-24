// Janela civil da agenda: a partir de amanhã até o mesmo dia em dois meses.

export function dataCivil(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

export function mesmaDataCivil(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function somarMeses(data: Date, quantidade: number): Date {
  const mesAlvo = data.getMonth() + quantidade;
  const ultimoDia = new Date(data.getFullYear(), mesAlvo + 1, 0).getDate();
  return new Date(
    data.getFullYear(),
    mesAlvo,
    Math.min(data.getDate(), ultimoDia)
  );
}

export function inicioJanelaAgenda(hoje = new Date()): Date {
  const base = dataCivil(hoje);
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + 1);
}

export function fimJanelaAgenda(hoje = new Date()): Date {
  return somarMeses(dataCivil(hoje), 2);
}

export function formatarDataBR(data: Date): string {
  return data.toLocaleDateString("pt-BR");
}

export function parsearDataBR(texto: string): Date | null {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(texto.trim())) {
    return null;
  }

  const [diaTexto, mesTexto, anoTexto] = texto.trim().split("/");
  const dia = Number(diaTexto);
  const mes = Number(mesTexto);
  const ano = Number(anoTexto);
  const data = new Date(ano, mes - 1, dia);

  if (
    Number.isNaN(data.getTime()) ||
    data.getDate() !== dia ||
    data.getMonth() !== mes - 1 ||
    data.getFullYear() !== ano
  ) {
    return null;
  }

  return data;
}

export function validarDataAgenda(data: Date, hoje = new Date()): string | null {
  const escolhida = dataCivil(data);
  const inicio = inicioJanelaAgenda(hoje);
  const fim = fimJanelaAgenda(hoje);

  if (Number.isNaN(escolhida.getTime())) {
    return "Escolha uma data válida.";
  }

  if (escolhida.getTime() < inicio.getTime()) {
    return "Não é possível agendar para hoje nem para uma data passada.";
  }

  if (escolhida.getTime() > fim.getTime()) {
    return "A agenda abre no máximo 2 meses à frente.";
  }

  return null;
}

export function dataEstaNaJanela(data: Date, hoje = new Date()): boolean {
  return validarDataAgenda(data, hoje) === null;
}

export function mesesDaJanela(hoje = new Date()): Date[] {
  const inicio = inicioJanelaAgenda(hoje);
  const fim = fimJanelaAgenda(hoje);
  const meses: Date[] = [];
  let cursor = new Date(inicio.getFullYear(), inicio.getMonth(), 1);

  while (
    cursor.getFullYear() < fim.getFullYear() ||
    (cursor.getFullYear() === fim.getFullYear() &&
      cursor.getMonth() <= fim.getMonth())
  ) {
    meses.push(new Date(cursor));
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }

  return meses;
}
