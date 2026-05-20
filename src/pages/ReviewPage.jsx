import { useEffect, useState } from "react";
import ProblemRow from "../components/ProblemRow.jsx";
import StatusFilter from "../components/StatusFilter.jsx";
import { loadProblems } from "../utils/problemUtils.js";
import { getUserRecords } from "../utils/storage.js";

const weight = { red: 0, yellow: 1, unknown: 2, green: 3 };

export default function ReviewPage() {
  const [problems, setProblems] = useState([]);
  const [records, setRecords] = useState({});
  const [statuses, setStatuses] = useState(["red", "yellow"]);
  const [state, setState] = useState("loading");

  useEffect(() => {
    loadProblems().then((data) => {
      setProblems(data);
      setRecords(getUserRecords());
      setState("ready");
    }).catch(() => setState("error"));
  }, []);

  const list = [...problems]
    .filter((problem) => statuses.includes(records[problem.id]?.status || "unknown"))
    .sort((a, b) => {
      const ar = records[a.id] || {};
      const br = records[b.id] || {};
      const as = ar.status || "unknown";
      const bs = br.status || "unknown";
      return weight[as] - weight[bs]
        || a.difficulty - b.difficulty
        || String(ar.lastUpdated || "").localeCompare(String(br.lastUpdated || ""));
    });

  if (state === "loading") return <div className="card">loading...</div>;
  if (state === "error") return <div className="card error">复习数据加载失败。</div>;

  return (
    <section>
      <div className="card">
        <h1>今日复习</h1>
        <p>默认展示一点不会和不熟的题，也可以临时加入未开始或已 AC。</p>
        <StatusFilter value={statuses} onChange={setStatuses} />
      </div>
      <div className="card list">
        {!list.length ? <p className="empty">暂无需要复习的题目。</p> : null}
        {list.map((problem) => <ProblemRow problem={problem} record={records[problem.id]} key={problem.id} />)}
      </div>
    </section>
  );
}
