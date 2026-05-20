import { useEffect, useMemo, useState } from "react";
import ProblemRow from "../components/ProblemRow.jsx";
import SearchBox from "../components/SearchBox.jsx";
import StatusFilter from "../components/StatusFilter.jsx";
import { groupProblemsByTag, loadProblems, sortProblems } from "../utils/problemUtils.js";
import { getUserRecords } from "../utils/storage.js";

export default function ProblemListPage() {
  const [problems, setProblems] = useState([]);
  const [records, setRecords] = useState({});
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [tag, setTag] = useState("all");
  const [statuses, setStatuses] = useState(["unknown", "green", "yellow", "red"]);
  const [state, setState] = useState("loading");

  useEffect(() => {
    loadProblems().then((data) => {
      setProblems(data);
      setRecords(getUserRecords());
      setState("ready");
    }).catch(() => setState("error"));
  }, []);

  const tags = useMemo(() => Object.keys(groupProblemsByTag(problems)), [problems]);
  const filtered = sortProblems(problems.filter((problem) => {
    const text = `${problem.id} ${problem.title}`.toLowerCase();
    const status = records[problem.id]?.status || "unknown";
    return text.includes(query.trim().toLowerCase())
      && (difficulty === "all" || String(problem.difficulty) === difficulty)
      && (tag === "all" || (problem.tags || []).includes(tag))
      && statuses.includes(status);
  }));

  if (state === "loading") return <div className="card">loading...</div>;
  if (state === "error") return <div className="card error">题库数据加载失败。</div>;

  return (
    <section>
      <div className="card filters">
        <h1>完整题库浏览</h1>
        <SearchBox value={query} onChange={setQuery} />
        <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
          <option value="all">全部难度</option>
          <option value="2">普及-</option>
          <option value="3">普及/提高-</option>
          <option value="4">普及+/提高</option>
          <option value="5">提高+/省选-</option>
        </select>
        <select value={tag} onChange={(event) => setTag(event.target.value)}>
          <option value="all">全部知识点</option>
          {tags.map((item) => <option value={item} key={item}>{item}</option>)}
        </select>
        <StatusFilter value={statuses} onChange={setStatuses} />
      </div>
      <div className="card list">
        {!filtered.length ? <p className="empty">暂无符合条件的题目</p> : null}
        {filtered.map((problem) => <ProblemRow problem={problem} record={records[problem.id]} key={problem.id} />)}
      </div>
    </section>
  );
}
