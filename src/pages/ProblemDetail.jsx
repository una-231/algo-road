import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProblemRow from "../components/ProblemRow.jsx";
import StatusSquare from "../components/StatusSquare.jsx";
import { buildProblemMap, getStatusLabel, loadProblems } from "../utils/problemUtils.js";
import { getRecommendedProblems } from "../utils/recommend.js";
import { getUserRecords, saveUserRecord } from "../utils/storage.js";

const errorTagOptions = ["初始化", "边界条件", "long long", "下标", "状态转移", "搜索剪枝", "读题", "复杂度"];

export default function ProblemDetail() {
  const { id } = useParams();
  const [problems, setProblems] = useState([]);
  const [records, setRecords] = useState({});
  const [state, setState] = useState("loading");

  useEffect(() => {
    loadProblems().then((data) => {
      setProblems(data);
      setRecords(getUserRecords());
      setState("ready");
    }).catch(() => setState("error"));
  }, [id]);

  const problemMap = useMemo(() => buildProblemMap(problems), [problems]);
  const problem = problemMap.get(id);
  const record = records[id] || {};
  const status = record.status || "unknown";
  const recommends = getRecommendedProblems(problem, problems);

  function updateRecord(patch) {
    const next = saveUserRecord(id, patch);
    setRecords({ ...getUserRecords(), [id]: next });
  }

  function toggleErrorTag(tag) {
    const current = new Set(record.userErrorTags || []);
    if (current.has(tag)) current.delete(tag);
    else current.add(tag);
    updateRecord({ userErrorTags: [...current] });
  }

  if (state === "loading") return <div className="card">loading...</div>;
  if (state === "error") return <div className="card error">题目加载失败。</div>;
  if (!problem) return <div className="card empty">没有找到题目 {id}。</div>;

  return (
    <section>
      <div className="card detail-card">
        <div className="detail-title">
          <div>
            <h1>{problem.id} {problem.title}</h1>
            <p>{problem.difficultyName}</p>
          </div>
          <StatusSquare status={status} withLabel />
        </div>
        <div className="tags detail-tags">
          {(problem.tags || []).map((tag) => <span className="tag" key={tag}>{tag}</span>)}
        </div>
        <div className="actions detail-actions">
          <a className="button primary open-problem-button" href={problem.url} target="_blank" rel="noreferrer">打开洛谷题目</a>
          {["green", "yellow", "red"].map((item) => (
            <button className={status === item ? "selected" : ""} onClick={() => updateRecord({ status: item })} key={item}>
              {getStatusLabel(item)}
            </button>
          ))}
        </div>
        <label className="field">
          <span>备注</span>
          <textarea
            value={record.note || ""}
            onChange={(event) => updateRecord({ note: event.target.value })}
            placeholder="记录思路、坑点、复习提醒"
          />
        </label>
        <div>
          <h2>易错点标签</h2>
          <div className="tag-list inline">
            {errorTagOptions.map((tag) => (
              <button className={(record.userErrorTags || []).includes(tag) ? "active" : ""} onClick={() => toggleErrorTag(tag)} key={tag}>
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="card">
        <h2>相关推荐 5 道题</h2>
        <div className="list">
          {recommends.map((item) => <ProblemRow problem={item} record={records[item.id]} key={item.id} compact />)}
          {!recommends.length ? <p className="empty">暂无推荐题。</p> : null}
        </div>
      </div>
      <Link className="text-link" to="/problems">返回题库</Link>
    </section>
  );
}
