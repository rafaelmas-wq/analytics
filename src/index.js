// src/index.js
import express from "express";
import {
  getEventosBQ,
  getDashboardCompletoBQ
} from "./bigquery.js";

const app = express();

app.use(express.json());

// ================================
// ROOT
// ================================
app.get("/", (req, res) => {
  res.send("API Analytics rodando 🚀");
});

// ================================
// EVENTOS
// ================================
app.get("/bq/events", async (req, res) => {
  try {
    const start = req.query.start || "20210101";
    const end = req.query.end || "20210131";

    const data = await getEventosBQ(start, end);

    res.json({ start, end, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      erro: "Erro ao consultar eventos",
      detalhe: error.message
    });
  }
});

// ================================
// DASHBOARD
// ================================
app.get("/bq/dashboard", async (req, res) => {
  try {
    const start = req.query.start || "20210101";
    const end = req.query.end || "20210131";

    const data = await getDashboardCompletoBQ(start, end);

    res.json({ start, end, ...data });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      erro: "Erro no dashboard",
      detalhe: error.message
    });
  }
});

// ================================
// START SERVER
// ================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});