import type { Leitura } from '../types';

function limitar(valor: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, valor));
}

function arredondar(valor: number, casas = 1): number {
  const fator = 10 ** casas;
  return Math.round(valor * fator) / fator;
}

/**
 * Gera uma nova leitura a partir da anterior, com pequenas variações
 * aleatórias (passeio aleatório), imitando sensores reais como DHT22 e LDR.
 */
export function gerarLeituraSimulada(anterior?: Leitura, aleatorio: () => number = Math.random): Leitura {
  const base: Leitura = anterior ?? {
    timestamp: Date.now(),
    temperatura: 24,
    umidade: 55,
    luminosidade: 60,
  };

  const variacao = (amplitude: number) => (aleatorio() - 0.5) * 2 * amplitude;

  return {
    timestamp: Date.now(),
    temperatura: arredondar(limitar(base.temperatura + variacao(0.6), 10, 40)),
    umidade: arredondar(limitar(base.umidade + variacao(1.5), 15, 95)),
    luminosidade: arredondar(limitar(base.luminosidade + variacao(4), 0, 100), 0),
  };
}
