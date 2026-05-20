import { useEffect, useMemo, useState } from "react";
import ProblemRow from "../components/ProblemRow.jsx";
import { buildProblemMap, groupProblemsByTag, loadProblems, loadRoutes } from "../utils/problemUtils.js";
import { getStatusLabel } from "../utils/problemUtils.js";
import { getUserRecords } from "../utils/storage.js";
import { calculateStats } from "../utils/stats.js";

export default function StatsPage() {
  const [problems, setProblems] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [records, setRecords] = useState({});
  const [scope, setScope] = useState("route");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [state, setState] = useState("loading");

  useEffect(() => {
    Promise.all([loadProblems(), loadRoutes()]).then(([problemData, routeData]) => {
      setProblems(problemData);
      setRoutes(routeData);
      setRecords(getUserRecords());
      setState("ready");
    }).catch(() => setState("error"));
  }, []);

  const scopedProblems = useMemo(() => {
    if (scope === "all") return problems;
    const map = buildProblemMap(problems);
    const ids = [...new Set(routes.flatMap((route) => route.problems))];
    return ids.map((id) => map.get(id)).filter(Boolean);
  }, [problems, routes, scope]);
  const stats = calculateStats(scopedProblems, records);
  const selectedProblems = scopedProblems.filter((problem) => (records[problem.id]?.status || "unknown") === selectedStatus);
  const grouped = groupProblemsByTag(selectedProblems);

  if (state === "loading") return <div className="card">loading...</div>;
  if (state === "error") return <div className="card error">统计数据加载失败。</div>;

  if (selectedStatus) {
    return (
      <section>
        <div className="card">
          <button onClick={() => setSelectedStatus("")}>返回统计总览</button>
          <h1>{getStatusLabel(selectedStatus)}题目</h1>
        </div>
        {Object.entries(grouped).map(([tag, list]) => (
          <div className="card" key={tag}>
            <h2>{tag}</h2>
            <div className="list">
              {list.map((problem) => <ProblemRow problem={problem} record={records[problem.id]} key={problem.id} compact />)}
            </div>
          </div>
        ))}
        {!selectedProblems.length ? <div className="card empty">暂无该状态题目。</div> : null}
      </section>
    );
  }

  return (
    <section>
      <div className="card">
        <h1>统计分析</h1>
        <div className="segmented">
          <button className={scope === "route" ? "active" : ""} onClick={() => setScope("route")}>精选 50 题</button>
          <button className={scope === "all" ? "active" : ""} onClick={() => setScope("all")}>完整题库</button>
        </div>
      </div>
      <div className="stats-grid">
        <button className="stat-card"><strong>{stats.total}</strong><span>总题数</span></button>
        <button className="stat-card"><strong>{stats.done}</strong><span>已做题数</span></button>
        {["unknown", "green", "yellow", "red"].map((status) => (
          <button className="stat-card" onClick={() => setSelectedStatus(status)} key={status}>
            <strong>{stats[status]}</strong>
            <span>{getStatusLabel(status)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
