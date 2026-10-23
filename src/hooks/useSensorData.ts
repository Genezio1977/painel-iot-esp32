import { useEffect, useRef, useState } from 'react';
import type { Leitura, Modo, StatusConexao } from '../types';
import { adicionarAoHistorico, parseLeitura } from '../utils/sensores';
import { gerarLeituraSimulada } from '../utils/simulador';

interface Opcoes {
  modo: Modo;
  /** Endereço do ESP32, ex.: http://192.168.0.50 */
  enderecoEsp32: string;
  /** Intervalo entre leituras, em milissegundos. */
  intervaloMs: number;
  pausado: boolean;
}

interface Resultado {
  historico: Leitura[];
  atual: Leitura | null;
  status: StatusConexao;
  erro: string | null;
  limpar: () => void;
}

interface Estado {
  /** Identifica de onde vieram os dados (modo + endereço). */
  fonte: string;
  historico: Leitura[];
  status: StatusConexao;
  erro: string | null;
}

const estadoInicial = (fonte: string): Estado => ({ fonte, historico: [], status: 'conectando', erro: null });

/**
 * Busca leituras periodicamente — do simulador ou do endpoint
 * `GET /api/dados` do ESP32 — e mantém um histórico limitado.
 * Ao trocar de modo ou de endereço, o histórico recomeça do zero.
 */
export function useSensorData({ modo, enderecoEsp32, intervaloMs, pausado }: Opcoes): Resultado {
  const fonte = `${modo}|${enderecoEsp32}`;
  const [estado, setEstado] = useState<Estado>(() => estadoInicial(fonte));
  const ultimaRef = useRef<Leitura | undefined>(undefined);

  // Dados de uma fonte anterior são descartados já na renderização.
  const atualizado = estado.fonte === fonte ? estado : estadoInicial(fonte);

  // Ao mudar a fonte, a próxima leitura simulada parte dos valores iniciais.
  // (Declarado antes do efeito de busca para rodar primeiro.)
  useEffect(() => {
    ultimaRef.current = undefined;
  }, [fonte]);

  useEffect(() => {
    if (pausado) return;

    let cancelado = false;
    const controller = new AbortController();

    const registrar = (leitura: Leitura) => {
      ultimaRef.current = leitura;
      setEstado((e) => ({
        fonte,
        historico: adicionarAoHistorico(e.fonte === fonte ? e.historico : [], leitura),
        status: 'conectado',
        erro: null,
      }));
    };

    const falhar = (mensagem: string) => {
      setEstado((e) => ({ ...(e.fonte === fonte ? e : estadoInicial(fonte)), status: 'erro', erro: mensagem }));
    };

    const buscar = async () => {
      if (modo === 'simulado') {
        registrar(gerarLeituraSimulada(ultimaRef.current));
        return;
      }

      try {
        const url = `${enderecoEsp32.replace(/\/+$/, '')}/api/dados`;
        const timeout = AbortSignal.timeout(Math.max(intervaloMs - 100, 1500));
        const resposta = await fetch(url, { signal: AbortSignal.any([controller.signal, timeout]) });
        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
        const leitura = parseLeitura(await resposta.json());
        if (!cancelado) registrar(leitura);
      } catch (e) {
        if (!cancelado) falhar(e instanceof Error ? e.message : 'Falha ao conectar ao ESP32');
      }
    };

    buscar();
    const id = window.setInterval(buscar, intervaloMs);

    return () => {
      cancelado = true;
      controller.abort();
      window.clearInterval(id);
    };
  }, [fonte, modo, enderecoEsp32, intervaloMs, pausado]);

  return {
    historico: atualizado.historico,
    atual: atualizado.historico.at(-1) ?? null,
    status: atualizado.status,
    erro: atualizado.erro,
    limpar: () => {
      ultimaRef.current = undefined;
      setEstado(estadoInicial(fonte));
    },
  };
}
