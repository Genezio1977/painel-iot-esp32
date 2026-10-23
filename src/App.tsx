import { useState } from 'react';
import { AlertSettings } from './components/AlertSettings';
import { ConnectionPanel } from './components/ConnectionPanel';
import { HistoryChart } from './components/HistoryChart';
import { SensorCard } from './components/SensorCard';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSensorData } from './hooks/useSensorData';
import type { ChaveSensor, ConfigAlertas, Modo } from './types';
import { baixarCsv } from './utils/exportarCsv';
import { ALERTAS_PADRAO, SENSORES, calcularEstatisticas, foraDoLimite, formatarHora } from './utils/sensores';

export default function App() {
  const [modo, setModo] = useLocalStorage<Modo>('painel:modo', 'simulado');
  const [endereco, setEndereco] = useLocalStorage('painel:endereco', '');
  const [intervaloMs, setIntervaloMs] = useLocalStorage('painel:intervalo', 2000);
  const [alertas, setAlertas] = useLocalStorage<ConfigAlertas>('painel:alertas', ALERTAS_PADRAO);
  const [pausado, setPausado] = useState(false);
  const [selecionado, setSelecionado] = useState<ChaveSensor>('temperatura');

  const { historico, atual, status, erro, limpar } = useSensorData({
    modo,
    enderecoEsp32: endereco,
    intervaloMs,
    pausado: pausado || (modo === 'esp32' && !endereco),
  });

  const sensorAtivo = SENSORES.find((s) => s.chave === selecionado)!;
  const totalAlertas = atual ? SENSORES.filter((s) => foraDoLimite(atual[s.chave], alertas[s.chave])).length : 0;

  return (
    <div className="app">
      <header className="cabecalho">
        <div>
          <h1>Painel IoT ESP32</h1>
          <p className="subtitulo">Monitoramento de sensores em tempo real</p>
        </div>
        {atual && (
          <p className="ultima-leitura">
            Última leitura: <time>{formatarHora(atual.timestamp)}</time>
            {totalAlertas > 0 && (
              <span className="contador-alertas">
                {totalAlertas} {totalAlertas === 1 ? 'alerta' : 'alertas'}
              </span>
            )}
          </p>
        )}
      </header>

      <ConnectionPanel
        modo={modo}
        onModoChange={setModo}
        endereco={endereco}
        onEnderecoChange={setEndereco}
        intervaloMs={intervaloMs}
        onIntervaloChange={setIntervaloMs}
        pausado={pausado}
        onPausar={() => setPausado((p) => !p)}
        status={modo === 'esp32' && !endereco ? 'conectando' : status}
        erro={erro}
      />

      {modo === 'esp32' && !endereco && (
        <p className="dica">Digite o endereço IP que aparece no Monitor Serial do ESP32 e clique em Conectar.</p>
      )}

      <main>
        <section className="grade-cards" aria-label="Leituras atuais">
          {SENSORES.map((s) => (
            <SensorCard
              key={s.chave}
              sensor={s}
              valor={atual ? atual[s.chave] : null}
              limites={alertas[s.chave]}
              estatisticas={calcularEstatisticas(historico, s.chave)}
              selecionado={selecionado === s.chave}
              onSelecionar={() => setSelecionado(s.chave)}
            />
          ))}
        </section>

        <section className="card-grafico" aria-label="Histórico">
          <div className="grafico-cabecalho">
            <h2>
              Histórico — {sensorAtivo.nome} <span className="contagem">({historico.length} leituras)</span>
            </h2>
            <div className="acoes">
              <button type="button" className="botao-secundario" onClick={() => baixarCsv(historico)} disabled={!historico.length}>
                Exportar CSV
              </button>
              <button type="button" className="botao-secundario" onClick={limpar} disabled={!historico.length}>
                Limpar
              </button>
            </div>
          </div>
          <HistoryChart historico={historico} sensor={sensorAtivo} limites={alertas[selecionado]} />
          <p className="legenda">A faixa sombreada mostra o intervalo aceitável configurado nos limites de alerta.</p>
        </section>

        <AlertSettings config={alertas} onChange={setAlertas} />
      </main>

      <footer className="rodape">
        Projeto de portfólio de <a href="https://github.com/Genezio1977">Genézio T. Corrêa</a> · React + TypeScript + ESP32
      </footer>
    </div>
  );
}
