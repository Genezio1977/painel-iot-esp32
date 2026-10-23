/*
 * Painel IoT ESP32 — firmware de exemplo
 * ---------------------------------------
 * Lê temperatura e umidade (DHT22) e luminosidade (LDR) e disponibiliza
 * as leituras em JSON no endpoint HTTP GET /api/dados, consumido pelo
 * painel web em React.
 *
 * Ligações:
 *   DHT22  -> dados no GPIO 4 (com resistor de 10k para 3V3)
 *   LDR    -> divisor de tensão com resistor de 10k, saída no GPIO 34 (ADC)
 *
 * Bibliotecas (Gerenciador de Bibliotecas da Arduino IDE):
 *   - "DHT sensor library" (Adafruit) + "Adafruit Unified Sensor"
 *
 * Sem sensores? Defina USAR_SENSORES como 0 para enviar valores simulados.
 */

#include <WiFi.h>
#include <WebServer.h>
#include <DHT.h>

#define USAR_SENSORES 1

// ====== Configure sua rede Wi-Fi ======
const char* WIFI_SSID  = "NOME_DA_SUA_REDE";
const char* WIFI_SENHA = "SENHA_DA_SUA_REDE";

// ====== Pinos ======
const int PINO_DHT = 4;
const int PINO_LDR = 34;

DHT dht(PINO_DHT, DHT22);
WebServer servidor(80);

float ultimaTemperatura = NAN;
float ultimaUmidade = NAN;

void adicionarCabecalhosCors() {
  // Permite que o painel (rodando em outro endereço) leia os dados.
  servidor.sendHeader("Access-Control-Allow-Origin", "*");
  servidor.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  servidor.sendHeader("Cache-Control", "no-store");
}

int lerLuminosidadePercentual() {
  int bruto = analogRead(PINO_LDR);  // 0..4095
  return map(bruto, 0, 4095, 0, 100);
}

void tratarDados() {
  float temperatura, umidade;
  int luminosidade;

#if USAR_SENSORES
  temperatura = dht.readTemperature();
  umidade = dht.readHumidity();
  // O DHT22 às vezes falha uma leitura: reaproveita a última válida.
  if (isnan(temperatura)) temperatura = ultimaTemperatura; else ultimaTemperatura = temperatura;
  if (isnan(umidade)) umidade = ultimaUmidade; else ultimaUmidade = umidade;
  luminosidade = lerLuminosidadePercentual();

  if (isnan(temperatura) || isnan(umidade)) {
    adicionarCabecalhosCors();
    servidor.send(503, "application/json", "{\"erro\":\"sensor DHT22 sem leitura\"}");
    return;
  }
#else
  temperatura = 24.0 + random(-20, 21) / 10.0;
  umidade = 55.0 + random(-50, 51) / 10.0;
  luminosidade = random(40, 81);
#endif

  char json[128];
  snprintf(json, sizeof(json),
           "{\"temperatura\":%.1f,\"umidade\":%.1f,\"luminosidade\":%d}",
           temperatura, umidade, luminosidade);

  adicionarCabecalhosCors();
  servidor.send(200, "application/json", json);
}

void tratarOptions() {
  adicionarCabecalhosCors();
  servidor.send(204);
}

void conectarWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_SENHA);
  Serial.print("Conectando ao Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Conectado! Use no painel: http://");
  Serial.println(WiFi.localIP());
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  analogReadResolution(12);
  conectarWifi();

  servidor.on("/api/dados", HTTP_GET, tratarDados);
  servidor.on("/api/dados", HTTP_OPTIONS, tratarOptions);
  servidor.onNotFound([]() {
    adicionarCabecalhosCors();
    servidor.send(404, "application/json", "{\"erro\":\"rota nao encontrada\"}");
  });
  servidor.begin();
  Serial.println("Servidor HTTP iniciado em /api/dados");
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi caiu, reconectando...");
    conectarWifi();
  }
  servidor.handleClient();
}
