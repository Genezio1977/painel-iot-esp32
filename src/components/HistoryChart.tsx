import { useMemo, useState } from 'react';
import type { Leitura, Limites } from '../types';
import type { InfoSensor } from '../utils/sensores';
import { formatarHora } from '../utils/sensores';

interface Props {
  historico: Leitura[];
  sensor: InfoSensor;
  limites: Limites;
}

const LARGURA = 640;
const ALTURA = 240;
const MARGEM = { topo: 16, direita: 16, baixo: 28, esquerda: 44 };

/**
 * Gráfico de linha feito à mão em SVG (sem bibliotecas),
 * com faixa de limites e tooltip ao passar o mouse.
 */
export function HistoryChart({ historico, sensor, limites }: Props) {
  const [indiceHover, setIndiceHover] = useState<number | null>(null);

  const larguraUtil = LARGURA - MARGEM.esquerda - MARGEM.direita;
  const alturaUtil = ALTURA - MARGEM.topo - MARGEM.baixo;

  const { pontos, escalaY, ticksY } = useMemo(() => {
    const valores = historico.map((l) => l[sensor.chave]);
    const minDados = Math.min(...valores, limites.min);
    const maxDados = Math.max(...valores, limites.max);
    const folga = (maxDados - minDados) * 0.1 || 1;
    const yMin = Math.floor(minDados - folga);
    const yMax = Math.ceil(maxDados + folga);

    const escalaY = (v: number) => MARGEM.topo + alturaUtil - ((v - yMin) / (yMax - yMin)) * alturaUtil;
    const passoX = historico.length > 1 ? larguraUtil / (historico.length - 1) : 0;

    const pontos = historico.map((l, i) => ({
      x: MARGEM.esquerda + i * passoX,
      y: escalaY(l[sensor.chave]),
      leitura: l,
    }));

    const ticksY = Array.from({ length: 5 }, (_, i) => yMin + ((yMax - yMin) * i) / 4);

    return { pontos, escalaY, ticksY };
  }, [historico, sensor.chave, limites, alturaUtil, larguraUtil]);

  if (historico.length < 2) {
    return <div className="grafico-vazio">Aguardando leituras…</div>;
  }

  const caminho = pontos.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${caminho} L${pontos.at(-1)!.x},${MARGEM.topo + alturaUtil} L${pontos[0].x},${MARGEM.topo + alturaUtil} Z`;

  const faixaTopo = escalaY(limites.max);
  const faixaBase = escalaY(limites.min);

  const aoMoverMouse = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * LARGURA;
    let maisProximo = 0;
    let menorDist = Infinity;
    pontos.forEach((p, i) => {
      const d = Math.abs(p.x - x);
      if (d < menorDist) {
        menorDist = d;
        maisProximo = i;
      }
    });
    setIndiceHover(maisProximo);
  };

  const hover = indiceHover !== null ? pontos[indiceHover] : null;
  const gradId = `grad-${sensor.chave}`;

  return (
    <div className="grafico" style={{ '--cor-sensor': sensor.cor } as React.CSSProperties}>
      <svg
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        role="img"
        aria-label={`Histórico de ${sensor.nome.toLowerCase()}`}
        onMouseMove={aoMoverMouse}
        onMouseLeave={() => setIndiceHover(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Faixa de valores aceitáveis */}
        <rect
          className="faixa-limite"
          x={MARGEM.esquerda}
          y={faixaTopo}
          width={larguraUtil}
          height={Math.max(faixaBase - faixaTopo, 0)}
        />

        {ticksY.map((t) => (
          <g key={t}>
            <line className="grade" x1={MARGEM.esquerda} x2={LARGURA - MARGEM.direita} y1={escalaY(t)} y2={escalaY(t)} />
            <text className="rotulo-eixo" x={MARGEM.esquerda - 8} y={escalaY(t)} textAnchor="end" dominantBaseline="middle">
              {Math.round(t)}
            </text>
          </g>
        ))}

        <text className="rotulo-eixo" x={MARGEM.esquerda} y={ALTURA - 8}>
          {formatarHora(historico[0].timestamp)}
        </text>
        <text className="rotulo-eixo" x={LARGURA - MARGEM.direita} y={ALTURA - 8} textAnchor="end">
          {formatarHora(historico.at(-1)!.timestamp)}
        </text>

        <g className="linha-dados">
          <path d={area} fill={`url(#${gradId})`} />
          <path d={caminho} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        </g>

        {hover && (
          <g className="linha-dados">
            <line className="guia" x1={hover.x} x2={hover.x} y1={MARGEM.topo} y2={MARGEM.topo + alturaUtil} />
            <circle cx={hover.x} cy={hover.y} r="5" fill="currentColor" stroke="var(--fundo-card)" strokeWidth="2" />
          </g>
        )}
      </svg>

      {hover && (
        <div
          className="tooltip"
          style={{ left: `${(hover.x / LARGURA) * 100}%`, top: `${(hover.y / ALTURA) * 100}%` }}
        >
          <strong>
            {hover.leitura[sensor.chave].toLocaleString('pt-BR')} {sensor.unidade}
          </strong>
          <span>{formatarHora(hover.leitura.timestamp)}</span>
        </div>
      )}
    </div>
  );
}
