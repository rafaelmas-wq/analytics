// src/bigquery.js
import { BigQuery } from "@google-cloud/bigquery";

// 🔑 pega credenciais do Railway
const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

// 🔌 cria cliente BigQuery
const bigquery = new BigQuery({
  credentials,
  projectId: credentials.project_id
});

// ================================
// EVENTOS
// ================================
export async function getEventosBQ() {
  const query = `
    SELECT
      event_name,
      COUNT(*) as total
    FROM \`bigquery-public-data.ga4_obfuscated_sample_ecommerce.events_*\`
    WHERE _TABLE_SUFFIX BETWEEN '20210101' AND '20210131'
    GROUP BY event_name
    ORDER BY total DESC
    LIMIT 10
  `;

  const [rows] = await bigquery.query(query);
  return rows;
}