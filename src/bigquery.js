import { BigQuery } from "@google-cloud/bigquery";

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

const bigquery = new BigQuery({
  credentials,
  projectId: credentials.project_id
});

export async function getEventosBQ() {
  const query = `
    SELECT event_name, COUNT(*) as total
    FROM \`bigquery-public-data.ga4_obfuscated_sample_ecommerce.events_*\`
    GROUP BY event_name
    ORDER BY total DESC
    LIMIT 10
  `;

  const [rows] = await bigquery.query(query);
  return rows;
}