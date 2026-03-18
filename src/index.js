// src/index.js
import express from "express";
import axios from "axios";
import { getEventos } from "./ga4.js";

const app = express();
app.use(express.json());

// ================================
// ENV
// ================================
const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID;
const GA4_API_SECRET = process.env.GA4_API_SECRET;

// ================================
// ROTAS
// ================================

app.get("/", (req, res) => {
  res.send("API rodando 🚀");
});

// 🔎 Teste de leitura GA4
app.get("/ga4-test", async (req, res) => {
  try {
    const data = await getEventos(
      "261098144",
      "7daysAgo",
      "today",
      ["page_view", "session_start"]
    );

    res.json(data);
  } catch (error) {
    console.error("ERRO REAL:", error);

    res.status(500).json({
      error: "Erro ao buscar dados do GA4",
      detalhe: error.message,
    });
  }
});

// ================================
// FUNÇÕES AUXILIARES
// ================================

// client_id válido pro GA4
function gerarClientId() {
  return `${Math.floor(Math.random() * 1e9)}.${Date.now()}`;
}

// canais de tráfego
function getTrafficSource() {
  const sources = [
    { source: "google", medium: "cpc", campaign: "campanha_pago" },
    { source: "facebook", medium: "paid_social", campaign: "meta_ads" },
    { source: "(direct)", medium: "(none)", campaign: "(not set)" },
    { source: "instagram", medium: "social", campaign: "organic_social" },
    { source: "email", medium: "newsletter", campaign: "email_marketing" }
  ];
  return sources[Math.floor(Math.random() * sources.length)];
}

// gera usuário fake completo
function gerarUsuarioFake(id) {
  const sessionId = `${Date.now()}_${id}`;
  const traffic = getTrafficSource();

  const baseParams = {
    session_id: sessionId,
    engagement_time_msec: 100,
    debug_mode: true,
    ...traffic
  };

  const converteu = Math.random() > 0.6;

  const eventos = [
    {
      name: "session_start",
      params: baseParams
    },
    {
      name: "page_view",
      params: {
        ...baseParams,
        page_location: "https://dunavideos.com.br/home",
        page_title: "Home"
      }
    },
    {
      name: "page_view",
      params: {
        ...baseParams,
        page_location: "https://dunavideos.com.br/produto",
        page_title: "Produto"
      }
    }
  ];

  if (converteu) {
    eventos.push({
      name: "generate_lead",
      params: {
        ...baseParams,
        value: Math.floor(Math.random() * 500),
        currency: "BRL"
      }
    });
  }

  return {
    client_id: gerarClientId(),
    events: eventos
  };
}

// envio com DEBUG (retorna erros do GA4)
async function enviarParaGA4(payload) {
  if (!GA4_MEASUREMENT_ID || !GA4_API_SECRET) {
    throw new Error("GA4_MEASUREMENT_ID ou GA4_API_SECRET não definidos");
  }

  const url = `https://www.google-analytics.com/debug/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`;

  try {
    const response = await axios.post(url, payload);

    console.log("Resposta GA4:");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("Erro ao enviar evento:", error.response?.data || error.message);
  }
}

// ================================
// ENDPOINT GERADOR DE DADOS
// ================================

// POST (produção)
app.post("/seed-ga4", async (req, res) => {
  const totalUsuarios = req.body?.total || 50;

  try {
    await Promise.all(
      Array.from({ length: totalUsuarios }).map((_, i) => {
        const payload = gerarUsuarioFake(i);
        return enviarParaGA4(payload);
      })
    );

    res.json({
      status: "ok",
      usuarios_enviados: totalUsuarios
    });
  } catch (error) {
    res.status(500).json({
      erro: "Erro ao gerar dados",
      detalhe: error.message
    });
  }
});

// GET (teste rápido no navegador)
app.get("/seed-ga4", async (req, res) => {
  const totalUsuarios = 5;

  try {
    await Promise.all(
      Array.from({ length: totalUsuarios }).map((_, i) => {
        const payload = gerarUsuarioFake(i);
        return enviarParaGA4(payload);
      })
    );

    res.send(`Foram enviados ${totalUsuarios} usuários fake para GA4`);
  } catch (error) {
    res.status(500).send("Erro ao gerar dados");
  }
});

// ================================
// START SERVER
// ================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});