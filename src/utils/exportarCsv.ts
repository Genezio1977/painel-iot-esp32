import type { Leitura } from '../types';

export function gerarCsv(historico: Leitura[]): string {
  const cabecalho = 'data_hora;temperatura_c;umidade_pct;luminosidade_pct';
  const linhas = historico.map((l) =>
    [new Date(l.timestamp).toISOString(), l.temperatura, l.umidade, l.luminosidade].join(';'),
  );
  return [cabecalho, ...linhas].join('\n');
}

/** Baixa o histórico como arquivo .csv (abre direto no Excel em PT-BR). */
export function baixarCsv(historico: Leitura[]): void {
  const blob = new Blob(['﻿' + gerarCsv(historico)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `leituras-esp32-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
