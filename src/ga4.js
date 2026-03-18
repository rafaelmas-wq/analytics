import { BetaAnalyticsDataClient } from "@google-analytics/data";

const client = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GA4_CLIENT_EMAIL,
    private_key: process.env.GA4_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
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

  response.rows?.forEach((row) => {
    const event = row.dimensionValues[0].value;
    const count = parseInt(row.metricValues[0].value);
    result[event] = count;
  });

  return result;
}