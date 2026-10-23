import type { Limites } from '../types';
import type { Estatisticas, InfoSensor } from '../utils/sensores';
import { foraDoLimite } from '../utils/sensores';

interface Props {
  sensor: InfoSensor;
  valor: number | null;
  limites: Limites;
  estatisticas: Estatisticas | null;
  selecionado: boolean;
  onSelecionar: () => void;
}

export function SensorCard({ sensor, valor, limites, estatisticas, selecionado, onSelecionar }: Props) {
  const emAlerta = valor !== null && foraDoLimite(valor, limites);

  return (
    <button
      type="button"
      className={`card-sensor${selecionado ? ' selecionado' : ''}${emAlerta ? ' alerta' : ''}`}
      style={{ '--cor-sensor': sensor.cor } as React.CSSProperties}
      onClick={onSelecionar}
      aria-pressed={selecionado}
    >
      <div className="card-topo">
        <span className="card-nome">
          <span aria-hidden="true">{sensor.icone}</span> {sensor.nome}
        </span>
        {emAlerta && <span className="selo-alerta">Fora do limite</span>}
      </div>

      <div className="card-valor">
        {valor === null ? '--' : valor.toLocaleString('pt-BR')}
        <span className="card-unidade">{sensor.unidade}</span>
      </div>

      <dl className="card-stats">
        <div>
          <dt>Mín</dt>
          <dd>{estatisticas ? estatisticas.min.toLocaleString('pt-BR') : '--'}</dd>
        </div>
        <div>
          <dt>Média</dt>
          <dd>{estatisticas ? estatisticas.media.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : '--'}</dd>
        </div>
        <div>
          <dt>Máx</dt>
          <dd>{estatisticas ? estatisticas.max.toLocaleString('pt-BR') : '--'}</dd>
        </div>
      </dl>
    </button>
  );
}
