import { filterKnowledgeTags } from "./tagUtils.js";

export async function loadProblems() {
  const response = await fetch(`${import.meta.env.BASE_URL}data/problems.json`);
  if (!response.ok) throw new Error("题库数据加载失败");
  const data = await response.json();
  return Array.isArray(data)
    ? data.map((problem) => ({ ...problem, tags: filterKnowledgeTags(problem.tags) }))
    : [];
}

export async function loadRoutes() {
  const response = await fetch(`${import.meta.env.BASE_URL}data/routes.json`);
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export function getStatusLabel(status) {
  return {
    unknown: "未开始",
    green: "成功 AC",
    yellow: "不熟",
    red: "一点不会",
  }[status || "unknown"];
}

export function getStatusColor(status) {
  return {
    unknown: "#9ca3af",
    green: "#22c55e",
    yellow: "#eab308",
    red: "#ef4444",
  }[status || "unknown"];
}

export function groupProblemsByTag(problems) {
  const groups = {};
  for (const problem of problems) {
    const tags = problem.tags?.length ? problem.tags : ["未分类"];
    for (const tag of tags) {
      if (!groups[tag]) groups[tag] = [];
      groups[tag].push(problem);
    }
  }
  return Object.fromEntries(
    Object.entries(groups).sort(([a], [b]) => a.localeCompare(b, "zh-CN")),
  );
}

export function sortProblems(problems) {
  return [...problems].sort((a, b) => {
    const av = Number(String(a.id).slice(1));
    const bv = Number(String(b.id).slice(1));
    return a.difficulty - b.difficulty || av - bv;
  });
}

export function buildProblemMap(problems) {
  return new Map(problems.map((problem) => [problem.id, problem]));
}
