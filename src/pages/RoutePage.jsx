import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StatusSquare from "../components/StatusSquare.jsx";
import { buildProblemMap, loadProblems, loadRoutes, sortProblems } from "../utils/problemUtils.js";
import { getUserRecords } from "../utils/storage.js";

function RouteNode({ problem, index, record, tone }) {
  const status = record?.status || "unknown";
  return (
    <Link className={`map-node tone-${tone}`} to={`/problem/${problem.id}`} title={`${problem.id} ${problem.title}`}>
      <span className="node-index">{String(index + 1).padStart(2, "0")}</span>
      <span className="node-body">
        <span className="node-top">
          <span className="node-id">{problem.id}</span>
          <StatusSquare status={status} />
        </span>
        <span className="node-title">{problem.title}</span>
        <span className="node-meta">
          <span>{problem.difficultyName}</span>
        </span>
      </span>
    </Link>
  );
}

function getLane(problemIndex) {
  return [18, 50, 82][problemIndex % 3];
}

function buildCurvePath(fromIndex, toIndex) {
  const fromX = getLane(fromIndex);
  const toX = getLane(toIndex);
  const fromY = fromIndex * 98 + 80;
  const toY = toIndex * 98;
  const midY = (fromY + toY) / 2;
  return `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;
}

export default function RoutePage() {
  const [problems, setProblems] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [records, setRecords] = useState({});
  const [state, setState] = useState("loading");

  useEffect(() => {
    Promise.all([loadProblems(), loadRoutes()])
      .then(([problemData, routeData]) => {
        setProblems(problemData);
        setRoutes(routeData);
        setRecords(getUserRecords());
        setState("ready");
      })
      .catch(() => setState("error"));
  }, []);

  const problemMap = useMemo(() => buildProblemMap(problems), [problems]);
  const routeSections = routes.map((route) => ({
    ...route,
    problemItems: sortProblems(route.problems.map((id) => problemMap.get(id)).filter(Boolean)),
  }));
  const total = routeSections.reduce((sum, route) => sum + route.problemItems.length, 0);
  const done = routeSections
    .flatMap((route) => route.problemItems)
    .filter((problem) => (records[problem.id]?.status || "unknown") === "green").length;

  if (state === "loading") return <div className="card">loading...</div>;
  if (state === "error") return <div className="card error">路线数据加载失败。</div>;
  if (!routes.length || total === 0) return <div className="card empty">routes.json 为空，请先运行路线生成脚本。</div>;

  let globalIndex = 0;

  return (
    <section className="route-page">
      <div className="route-hero">
        <div>
          <p className="eyebrow">固定学习路线</p>
          <h1>精选 50 题路线</h1>
          <p>从基础模拟走到图论入门，按知识模块逐段推进，适合复试机考前系统刷一轮。</p>
        </div>
        <div className="route-progress">
          <strong>{done}/{total}</strong>
          <span>已 AC</span>
        </div>
      </div>

      <div className="roadmap">
        {routeSections.map((route, sectionIndex) => {
          const tone = (sectionIndex % 5) + 1;
          return (
          <section className={`road-section tone-${tone}`} key={route.routeId}>
            <aside className="stage-label">
              <span>阶段 {sectionIndex + 1}</span>
              <strong>{route.routeName}</strong>
              <small>{route.problemItems.length} 题</small>
            </aside>
            <div className="topology-map" style={{ height: `${Math.max(route.problemItems.length - 1, 0) * 98 + 80}px` }}>
              <svg className="route-lines" viewBox={`0 0 100 ${Math.max(route.problemItems.length - 1, 0) * 98 + 80}`} preserveAspectRatio="none">
                {route.problemItems.slice(1).map((problem, problemIndex) => (
                  <path d={buildCurvePath(problemIndex, problemIndex + 1)} key={problem.id} />
                ))}
              </svg>
              {route.problemItems.map((problem, problemIndex) => {
                const current = globalIndex;
                globalIndex += 1;
                return (
                  <div className="map-step" style={{ "--lane-x": getLane(problemIndex), "--step-y": problemIndex }} key={problem.id}>
                    <RouteNode problem={problem} record={records[problem.id]} index={current} tone={tone} />
                  </div>
                );
              })}
            </div>
          </section>
        );
        })}
      </div>
    </section>
  );
}
