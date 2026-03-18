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
      "213025502",
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