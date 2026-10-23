import type { ChaveSensor, ConfigAlertas, Leitura, Limites } from '../types';

export interface InfoSensor {
  chave: ChaveSensor;
  nome: string;
  unidade: string;
  icone: string;
  cor: string;
}

export const SENSORES: InfoSensor[] = [
  { chave: 'temperatura', nome: 'Temperatura', unidade: '°C', icone: '🌡️', cor: 'var(--cor-temp)' },
  { chave: 'umidade', nome: 'Umidade', unidade: '%', icone: '💧', cor: 'var(--cor-umid)' },
  { chave: 'luminosidade', nome: 'Luminosidade', unidade: '%', icone: '☀️', cor: 'var(--cor-luz)' },
];

export const ALERTAS_PADRAO: ConfigAlertas = {
  temperatura: { min: 18, max: 30 },
  umidade: { min: 30, max: 70 },
  luminosidade: { min: 10, max: 90 },
};

/** Número máximo de leituras guardadas no histórico do gráfico. */
export const MAX_HISTORICO = 60;

export function foraDoLimite(valor: number, limites: Limites): boolean {
  return valor < limites.min || valor > limites.max;
}

export interface Estatisticas {
  min: number;
  max: number;
  media: number;
}

export function calcularEstatisticas(historico: Leitura[], chave: ChaveSensor): Estatisticas | null {
  if (historico.length === 0) return null;
  const valores = historico.map((l) => l[chave]);
  const soma = valores.reduce((acc, v) => acc + v, 0);
  return {
    min: Math.min(...valores),
    max: Math.max(...valores),
    media: soma / valores.length,
  };
}

/** Adiciona uma leitura ao histórico, mantendo no máximo `limite` itens. */
export function adicionarAoHistorico(historico: Leitura[], nova: Leitura, limite = MAX_HISTORICO): Leitura[] {
  const atualizado = [...historico, nova];
  return atualizado.length > limite ? atualizado.slice(atualizado.length - limite) : atualizado;
}

/** Valida o JSON recebido do ESP32 e converte para uma Leitura. */
export function parseLeitura(dados: unknown): Leitura {
  if (typeof dados !== 'object' || dados === null) {
    throw new Error('Resposta inválida do ESP32');
  }
  const d = dados as Record<string, unknown>;
  const campos: ChaveSensor[] = ['temperatura', 'umidade', 'luminosidade'];
  for (const campo of campos) {
    if (typeof d[campo] !== 'number' || Number.isNaN(d[campo])) {
      throw new Error(`Campo "${campo}" ausente ou inválido`);
    }
  }
  return {
    timestamp: Date.now(),
    temperatura: d.temperatura as number,
    umidade: d.umidade as number,
    luminosidade: d.luminosidade as number,
  };
}

export function formatarHora(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
