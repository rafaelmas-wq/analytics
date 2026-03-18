// src/index.js
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-V5KBS6PRNL"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-V5KBS6PRNL');
</script>
import express from "express";
import axios from "axios";
import { getEventos } from "./ga4.js";

const app = express();

// ✅ Middleware para JSON (obrigatório para req.body)
app.use(express.json());

// Variáveis de ambiente GA4
const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID;
const GA4_API_SECRET = process.env.GA4_API_SECRET;

// ================================
// Rotas principais
// ================================

// Rota raiz
app.get("/", (req, res) => {
  res.send("API rodando 🚀");
});

// Endpoint GA4 teste
app.get("/ga4-test", async (req, res) => {
  try {
    const data = await getEventos(
      "261098144",               // propertyId GA4
      "7daysAgo",                // startDate
      "today",                   // endDate
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
// Funções de geração de dados fake
// ================================

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

async function enviarParaGA4(payload) {
  if (!GA4_MEASUREMENT_ID || !GA4_API_SECRET) {
    throw new Error("GA4_MEASUREMENT_ID ou GA4_API_SECRET não definidos");
  }

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`;

  try {
    await axios.post(url, payload);
  } catch (error) {
    console.error("Erro ao enviar evento:", error.response?.data || error.message);
  }
}

// ================================
// Endpoint para gerar dados fake
// ================================

// POST para produção / API
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

// GET temporário para teste rápido no navegador
app.get("/seed-ga4", async (req, res) => {
  const totalUsuarios = 500; // número menor só pra teste
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
// Inicializa servidor
// ================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});