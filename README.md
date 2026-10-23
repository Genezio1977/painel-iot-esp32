# Painel IoT ESP32

Painel web em **React + TypeScript** para monitorar, em tempo real, os sensores de um **ESP32**: temperatura, umidade e luminosidade.

O projeto une as duas pontas que gosto de desenvolver: o firmware do microcontrolador e a interface que o usuário vê e usa.

🔗 **Demonstração online:** https://genezio1977.github.io/painel-iot-esp32/ (modo simulado)

## Funcionalidades

- Cards com a leitura atual de cada sensor, com mínimo, média e máximo da sessão
- Gráfico de histórico **feito à mão em SVG** (sem biblioteca de gráficos), com tooltip e faixa de valores aceitáveis
- **Alertas configuráveis**: o card fica destacado quando um valor sai do limite definido
- Dois modos de dados:
  - **Simulado**: gera leituras realistas para funcionar sem hardware (usado na demonstração online)
  - **ESP32 real**: consulta o endpoint `GET /api/dados` do microcontrolador na rede local
- Pausar/retomar, escolher o intervalo de atualização e **exportar o histórico em CSV** (abre direto no Excel)
- Preferências salvas no navegador (`localStorage`)
- Tema claro/escuro automático, layout responsivo e cuidados de acessibilidade (teclado, `aria-*`, `prefers-reduced-motion`)
- Testes unitários com **Vitest** e deploy automático com **GitHub Actions**

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, CSS puro |
| Testes / Qualidade | Vitest, Oxlint |
| Hardware | ESP32, DHT22, LDR, Arduino (C++) |
| Deploy | GitHub Actions + GitHub Pages |

## Estrutura

```
src/
├── components/        # SensorCard, HistoryChart, ConnectionPanel, AlertSettings
├── hooks/             # useSensorData (busca periódica), useLocalStorage
├── utils/             # regras dos sensores, simulador, exportação CSV + testes
├── App.tsx
└── index.css
firmware/
└── esp32_painel/      # código do ESP32 (Arduino IDE)
```

## Como rodar

Pré-requisito: [Node.js](https://nodejs.org/) 20 ou superior.

```bash
npm install
npm run dev      # abre em http://localhost:5173
npm test         # roda os testes
npm run build    # gera a versão de produção em dist/
```

## Usando com um ESP32 de verdade

1. Abra `firmware/esp32_painel/esp32_painel.ino` na Arduino IDE.
2. Instale as bibliotecas **DHT sensor library** e **Adafruit Unified Sensor**.
3. Preencha `WIFI_SSID` e `WIFI_SENHA` e grave no ESP32.
   (Sem sensores? Mude `USAR_SENSORES` para `0` e ele envia valores simulados.)
4. No Monitor Serial (115200), copie o endereço exibido, por exemplo `http://192.168.0.50`.
5. Rode o painel **localmente** com `npm run dev`, escolha **ESP32 real** e cole o endereço.

Ligações: DHT22 no GPIO 4 (resistor de 10k para 3V3) e LDR em divisor de tensão com 10k no GPIO 34.

O ESP32 responde em JSON:

```json
{ "temperatura": 24.6, "umidade": 58.2, "luminosidade": 71 }
```

> **Por que rodar localmente?** A demonstração no GitHub Pages usa HTTPS, e os navegadores bloqueiam pedidos de uma página HTTPS para um endereço HTTP da rede local (como o ESP32). Rodando com `npm run dev`, o painel conversa normalmente com o microcontrolador.

## Publicando no GitHub Pages

O workflow em `.github/workflows/deploy.yml` roda os testes, gera o build e publica a cada `push` na branch `main`.
Para ativar: no repositório, vá em **Settings → Pages → Source** e escolha **GitHub Actions**.

## Próximos passos

- Enviar dados por WebSocket em vez de consultas periódicas
- Guardar o histórico em um banco de dados
- Suporte a vários ESP32 no mesmo painel

## Autor

**Genézio T. Corrêa** — Engenheiro de Software
[LinkedIn](https://www.linkedin.com/in/genezio-t-correa-853b33213) · [GitHub](https://github.com/Genezio1977)
