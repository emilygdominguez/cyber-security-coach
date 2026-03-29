import { useEffect, useState } from "react";

import HistoryTable from "../components/HistoryTable";
import StatsChart from "../components/StatsChart";
import { fetchHistory, fetchStats } from "../services/api";

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ counts: { Safe: 0, Suspicious: 0, "High Risk": 0 }, total_scans: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [historyResponse, statsResponse] = await Promise.all([fetchHistory(), fetchStats()]);
        setHistory(historyResponse.items || []);
        setStats(statsResponse);
      } catch (requestError) {
        setError(requestError.message);
      }
    }

    loadData();
  }, []);

  return (
    <div className="page-content">
      <section className="card page-intro">
        <p className="eyebrow">History</p>
        <h2>Recent privacy-aware scans and trends</h2>
        <p>
          This view stores only redacted inputs in lightweight local backend memory, which keeps
          the demo practical without retaining raw sensitive text by default.
        </p>
      </section>

      {error ? <p className="error-banner">{error}</p> : null}

      <div className="history-layout">
        <StatsChart counts={stats.counts} total={stats.total_scans} />
        <HistoryTable items={history} />
      </div>
    </div>
  );
}

export default HistoryPage;
