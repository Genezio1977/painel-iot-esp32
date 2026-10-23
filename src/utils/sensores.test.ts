import { describe, expect, it } from 'vitest';
import type { Leitura } from '../types';
import { adicionarAoHistorico, calcularEstatisticas, foraDoLimite, parseLeitura } from './sensores';
import { gerarLeituraSimulada } from './simulador';
import { gerarCsv } from './exportarCsv';

const leitura = (temperatura: number, timestamp = 0): Leitura => ({
  timestamp,
  temperatura,
  umidade: 50,
  luminosidade: 50,
});

describe('foraDoLimite', () => {
  it('detecta valores abaixo e acima do limite', () => {
    expect(foraDoLimite(10, { min: 18, max: 30 })).toBe(true);
    expect(foraDoLimite(35, { min: 18, max: 30 })).toBe(true);
    expect(foraDoLimite(25, { min: 18, max: 30 })).toBe(false);
  });
});

describe('calcularEstatisticas', () => {
  it('retorna null para histórico vazio', () => {
    expect(calcularEstatisticas([], 'temperatura')).toBeNull();
  });

  it('calcula mínimo, máximo e média', () => {
    const stats = calcularEstatisticas([leitura(20), leitura(30), leitura(25)], 'temperatura');
    expect(stats).toEqual({ min: 20, max: 30, media: 25 });
  });
});

describe('adicionarAoHistorico', () => {
  it('mantém apenas as últimas leituras', () => {
    let historico: Leitura[] = [];
    for (let i = 0; i < 5; i++) historico = adicionarAoHistorico(historico, leitura(i, i), 3);
    expect(historico.map((l) => l.temperatura)).toEqual([2, 3, 4]);
  });
});

describe('parseLeitura', () => {
  it('aceita o JSON enviado pelo ESP32', () => {
    const l = parseLeitura({ temperatura: 24.5, umidade: 60, luminosidade: 70 });
    expect(l.temperatura).toBe(24.5);
  });

  it('rejeita campos ausentes ou inválidos', () => {
    expect(() => parseLeitura({ temperatura: 24 })).toThrow('umidade');
    expect(() => parseLeitura(null)).toThrow();
    expect(() => parseLeitura({ temperatura: 'quente', umidade: 1, luminosidade: 1 })).toThrow('temperatura');
  });
});

describe('gerarLeituraSimulada', () => {
  it('mantém os valores dentro de faixas realistas', () => {
    let atual: Leitura | undefined;
    for (let i = 0; i < 1000; i++) {
      atual = gerarLeituraSimulada(atual);
      expect(atual.temperatura).toBeGreaterThanOrEqual(10);
      expect(atual.temperatura).toBeLessThanOrEqual(40);
      expect(atual.luminosidade).toBeGreaterThanOrEqual(0);
      expect(atual.luminosidade).toBeLessThanOrEqual(100);
    }
  });
});

describe('gerarCsv', () => {
  it('gera cabeçalho e uma linha por leitura', () => {
    const csv = gerarCsv([leitura(22, 0)]);
    expect(csv.split('\n')).toEqual([
      'data_hora;temperatura_c;umidade_pct;luminosidade_pct',
      '1970-01-01T00:00:00.000Z;22;50;50',
    ]);
  });
});
