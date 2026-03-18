import express from "express";
import { getEventos } from "./ga4.js";

const app = express();

app.get("/", (req, res) => {
  res.send("API rodando 🚀");
});

// 👉 NOVO ENDPOINT
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

import axios from "axios";

const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID;
const GA4_API_SECRET = process.env.GA4_API_SECRET;

async function enviarParaGA4(payload) {
  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`;

  try {
    await axios.post(url, payload);
  } catch (error) {
    console.error("Erro ao enviar evento:", error.response?.data || error.message);
  }
}
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
function gerarUsuarioFake(id) {
  const sessionId = `${Date.now()}_${id}`;
  const traffic = getTrafficSource();

  const converteu = Math.random() > 0.6;

  const eventos = [
    {
      name: "session_start",
      params: {
        session_id: sessionId,
        engagement_time_msec: 1,
        ...traffic
      }
    },
    {
      name: "page_view",
      params: {
        page_location: "https://dunavideos.com.br/home",
        page_title: "Home",
        session_id: sessionId,
        ...traffic
      }
    },
    {
      name: "page_view",
      params: {
        page_location: "https://dunavideos.com.br/produto",
        page_title: "Produto",
        session_id: sessionId,
        ...traffic
      }
    }
  ];

  // Simula abandono ou conversão
  if (converteu) {
    eventos.push({
      name: "generate_lead",
      params: {
        value: Math.floor(Math.random() * 500),
        currency: "BRL",
        session_id: sessionId,
        ...traffic
      }
    });
  }

  return {
    client_id: `user_${id}_${Date.now()}`,
    events: eventos
  };
}
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