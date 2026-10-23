/** Uma leitura enviada pelo ESP32 (ou gerada pelo simulador). */
export interface Leitura {
  /** Momento da leitura, em milissegundos (Date.now()). */
  timestamp: number;
  /** Temperatura em °C. */
  temperatura: number;
  /** Umidade relativa do ar em %. */
  umidade: number;
  /** Luminosidade em % (0 = escuro, 100 = muito claro). */
  luminosidade: number;
}

export type ChaveSensor = 'temperatura' | 'umidade' | 'luminosidade';

export type Modo = 'simulado' | 'esp32';

export type StatusConexao = 'conectado' | 'conectando' | 'erro';

export interface Limites {
  min: number;
  max: number;
}

export type ConfigAlertas = Record<ChaveSensor, Limites>;
