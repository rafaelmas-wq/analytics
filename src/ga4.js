import { BetaAnalyticsDataClient } from "@google-analytics/data";
import fs from "fs";

const credentials = JSON.parse(
  fs.readFileSync("./credentials.json", "utf-8")
);

const client = new BetaAnalyticsDataClient({
  credentials,
});

export async function getEventos(propertyId, startDate, endDate, events) {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "eventCount" }],
    dimensionFilter: {
      filter: {
        fieldName: "eventName",
        inListFilter: {
          values: events,
        },
      },
    },
  });

  const result = {};

  response.rows.forEach((row) => {
    const event = row.dimensionValues[0].value;
    const count = parseInt(row.metricValues[0].value);
    result[event] = count;
  });

  return result;
}