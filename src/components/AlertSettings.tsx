import type { ConfigAlertas } from '../types';
import { ALERTAS_PADRAO, SENSORES } from '../utils/sensores';

interface Props {
  config: ConfigAlertas;
  onChange: (config: ConfigAlertas) => void;
}

export function AlertSettings({ config, onChange }: Props) {
  const atualizar = (chave: keyof ConfigAlertas, campo: 'min' | 'max', valor: number) => {
    onChange({ ...config, [chave]: { ...config[chave], [campo]: valor } });
  };

  return (
    <details className="config-alertas">
      <summary>Limites de alerta</summary>
      <div className="grade-alertas">
        {SENSORES.map((s) => {
          const limites = config[s.chave];
          const invalido = limites.min >= limites.max;
          return (
            <fieldset key={s.chave}>
              <legend>
                {s.icone} {s.nome} ({s.unidade})
              </legend>
              <label>
                Mín
                <input
                  type="number"
                  value={limites.min}
                  onChange={(e) => atualizar(s.chave, 'min', Number(e.target.value))}
                />
              </label>
              <label>
                Máx
                <input
                  type="number"
                  value={limites.max}
                  onChange={(e) => atualizar(s.chave, 'max', Number(e.target.value))}
                />
              </label>
              {invalido && <small className="aviso">O mínimo deve ser menor que o máximo.</small>}
            </fieldset>
          );
        })}
      </div>
      <button type="button" className="botao-secundario" onClick={() => onChange(ALERTAS_PADRAO)}>
        Restaurar padrão
      </button>
    </details>
  );
}
