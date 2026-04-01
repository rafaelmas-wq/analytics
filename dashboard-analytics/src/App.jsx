import { useEffect, useState } from "react";

export default function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("https://analytics-production-4f43.up.railway.app/bq/dashboard")
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error(err));
  }, []);

  if (!data) return <p>Carregando dashboard...</p>;

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>📊 Dashboard Analytics</h1>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 20 }}>
        <Card title="Usuários" value={data.overview.users} />
        <Card title="Sessões" value={data.overview.sessions} />
        <Card title="Compras" value={data.overview.purchases} />
        <Card title="Receita" value={`R$ ${data.revenue}`} />
      </div>

      {/* Funil */}
      <h2>Funil de Conversão</h2>
      <ul>
        {data.funnel.map(f => (
          <li key={f.event_name}>
            {f.event_name}: {f.total}
          </li>
        ))}
      </ul>

      {/* Tráfego */}
      <h2>Tráfego</h2>
      <ul>
        {data.traffic.map((t, i) => (
          <li key={i}>
            {t.source} / {t.medium}: {t.sessions}
          </li>
        ))}
      </ul>

      {/* Páginas */}
      <h2>Páginas</h2>
      <ul>
        {data.pages.map((p, i) => (
          <li key={i}>
            {p.page}: {p.views}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={{
      background: "#f4f4f4",
      padding: 20,
      borderRadius: 10,
      minWidth: 150
    }}>
      <h4>{title}</h4>
      <h2>{value}</h2>
    </div>
  );
}