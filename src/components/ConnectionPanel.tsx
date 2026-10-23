import { useState } from 'react';
import type { Modo, StatusConexao } from '../types';

interface Props {
  modo: Modo;
  onModoChange: (modo: Modo) => void;
  endereco: string;
  onEnderecoChange: (endereco: string) => void;
  intervaloMs: number;
  onIntervaloChange: (ms: number) => void;
  pausado: boolean;
  onPausar: () => void;
  status: StatusConexao;
  erro: string | null;
}

const ROTULO_STATUS: Record<StatusConexao, string> = {
  conectado: 'Recebendo dados',
  conectando: 'Conectando…',
  erro: 'Sem conexão',
};

export function ConnectionPanel(props: Props) {
  const { modo, onModoChange, endereco, onEnderecoChange, intervaloMs, onIntervaloChange, pausado, onPausar, status, erro } =
    props;
  const [rascunho, setRascunho] = useState(endereco);

  const statusExibido = pausado ? 'Pausado' : ROTULO_STATUS[status];

  return (
    <section className="painel-conexao" aria-label="Configurações de conexão">
      <div className="seletor-modo" role="radiogroup" aria-label="Fonte dos dados">
        <button type="button" role="radio" aria-checked={modo === 'simulado'} onClick={() => onModoChange('simulado')}>
          Simulado
        </button>
        <button type="button" role="radio" aria-checked={modo === 'esp32'} onClick={() => onModoChange('esp32')}>
          ESP32 real
        </button>
      </div>

      {modo === 'esp32' && (
        <form
          className="form-endereco"
          onSubmit={(e) => {
            e.preventDefault();
            onEnderecoChange(rascunho.trim());
          }}
        >
          <label htmlFor="endereco">Endereço do ESP32</label>
          <div className="campo-com-botao">
            <input
              id="endereco"
              type="url"
              placeholder="http://192.168.0.50"
              value={rascunho}
              onChange={(e) => setRascunho(e.target.value)}
              required
            />
            <button type="submit">Conectar</button>
          </div>
        </form>
      )}

      <div className="controles">
        <label>
          Intervalo
          <select value={intervaloMs} onChange={(e) => onIntervaloChange(Number(e.target.value))}>
            <option value={1000}>1 s</option>
            <option value={2000}>2 s</option>
            <option value={5000}>5 s</option>
          </select>
        </label>
        <button type="button" className="botao-secundario" onClick={onPausar}>
          {pausado ? '▶ Retomar' : '⏸ Pausar'}
        </button>
        <span className={`status status-${pausado ? 'pausado' : status}`} role="status">
          <span className="ponto" aria-hidden="true" /> {statusExibido}
        </span>
      </div>

      {modo === 'esp32' && erro && !pausado && (
        <p className="mensagem-erro">
          Não foi possível ler {endereco || 'o ESP32'}: {erro}. Confira se o ESP32 está na mesma rede e se o painel está
          rodando localmente (veja o README).
        </p>
      )}
    </section>
  );
}
