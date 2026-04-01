export async function getDashboardCompletoBQ() {
  const query = `
    WITH base AS (
      SELECT *
      FROM \`bigquery-public-data.ga4_obfuscated_sample_ecommerce.events_*\`
    ),

    eventos AS (
      SELECT
        COUNT(DISTINCT user_pseudo_id) AS users,
        COUNTIF(event_name = 'session_start') AS sessions,
        COUNTIF(event_name = 'purchase') AS purchases
      FROM base
    ),

    receita AS (
      SELECT
        SUM(
          (SELECT value.int_value FROM UNNEST(event_params)
           WHERE key = 'value')
        ) AS revenue
      FROM base
      WHERE event_name = 'purchase'
    ),

    funnel AS (
      SELECT
        event_name,
        COUNT(*) AS total
      FROM base
      WHERE event_name IN (
        'view_item',
        'add_to_cart',
        'begin_checkout',
        'purchase'
      )
      GROUP BY event_name
    ),

    traffic AS (
      SELECT
        traffic_source.source,
        traffic_source.medium,
        COUNT(*) AS sessions
      FROM base
      GROUP BY source, medium
      ORDER BY sessions DESC
      LIMIT 5
    ),

    pages AS (
      SELECT
        ep.value.string_value AS page,
        COUNT(*) AS views
      FROM base,
      UNNEST(event_params) ep
      WHERE event_name = 'page_view'
        AND ep.key = 'page_location'
      GROUP BY page
      ORDER BY views DESC
      LIMIT 5
    )

    SELECT
      (SELECT AS STRUCT * FROM eventos) AS overview,
      (SELECT revenue FROM receita) AS revenue,
      (SELECT ARRAY_AGG(f) FROM funnel f) AS funnel,
      (SELECT ARRAY_AGG(t) FROM traffic t) AS traffic,
      (SELECT ARRAY_AGG(p) FROM pages p) AS pages
  `;

  const [rows] = await bigquery.query(query);

  const data = rows[0];

  // 🔥 calcula taxa de conversão
  const funnelMap = {};
  data.funnel.forEach(f => {
    funnelMap[f.event_name] = f.total;
  });

  const conversionRate =
    (funnelMap["purchase"] / funnelMap["view_item"]) * 100;

  return {
    overview: data.overview,
    revenue: data.revenue,
    funnel: data.funnel,
    conversionRate: conversionRate.toFixed(2) + "%",
    traffic: data.traffic,
    pages: data.pages
  };
}