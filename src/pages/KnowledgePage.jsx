import { useEffect, useMemo, useState } from "react";
import ProblemRow from "../components/ProblemRow.jsx";
import StatusFilter from "../components/StatusFilter.jsx";
import { groupProblemsByTag, loadProblems, sortProblems } from "../utils/problemUtils.js";
import { getUserRecords } from "../utils/storage.js";

const BATCH_SIZE = 80;

export default function KnowledgePage() {
  const [problems, setProblems] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");
  const [statuses, setStatuses] = useState(["unknown", "green", "yellow", "red"]);
  const [records, setRecords] = useState({});
  const [state, setState] = useState("loading");
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  useEffect(() => {
    loadProblems().then((data) => {
      setProblems(data);
      setRecords(getUserRecords());
      setState("ready");
    }).catch(() => setState("error"));
  }, []);

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [selectedTag, statuses]);

  const groups = useMemo(() => groupProblemsByTag(problems), [problems]);
  const tags = Object.keys(groups);
  const list = sortProblems((groups[selectedTag] || []).filter((problem) => statuses.includes(records[problem.id]?.status || "unknown")));
  const visibleList = list.slice(0, visibleCount);

  if (state === "loading") return <div className="card">loading...</div>;
  if (state === "error") return <div className="card error">题库数据加载失败。</div>;

  return (
    <section className="split">
      <aside className="card side-panel knowledge-panel">
        <div className="knowledge-head">
          <h1>知识点</h1>
          <button className="toggle-tags" onClick={() => setTagsExpanded(!tagsExpanded)}>
            {tagsExpanded ? "收起" : "展开"}
          </button>
        </div>
        <div className={`tag-list knowledge-tags ${tagsExpanded ? "expanded" : "collapsed"}`}>
          {tags.map((tag) => (
            <button className={selectedTag === tag ? "active" : ""} onClick={() => setSelectedTag(tag)} key={tag}>
              {tag}
            </button>
          ))}
        </div>
      </aside>
      <div>
        <div className="card">
          <h2>{selectedTag || "选择一个知识点"}</h2>
          <StatusFilter value={statuses} onChange={setStatuses} />
        </div>
        <div className="card list">
          {!selectedTag ? <p className="empty">请选择一个知识点。</p> : null}
          {selectedTag && !list.length ? <p className="empty">暂无符合条件的题目</p> : null}
          {visibleList.map((problem) => <ProblemRow problem={problem} record={records[problem.id]} key={problem.id} />)}
          {visibleCount < list.length ? (
            <button className="load-more" onClick={() => setVisibleCount(visibleCount + BATCH_SIZE)}>
              加载更多（已显示 {visibleList.length} / {list.length}）
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
