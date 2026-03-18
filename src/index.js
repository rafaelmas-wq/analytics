import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("API rodando 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
import { getEventos } from "./ga4.js";

app.get("/ga4-test", async (req, res) => {
  try {
    const data = await getEventos(
      "261098144",
      "2021-01-01",
      "2023-12-31",
      ["page_view"]
    );

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar GA4");
  }
});