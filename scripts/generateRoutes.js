import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mockProblems } from "./mockProblems.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const problemsPath = path.resolve(__dirname, "../public/data/problems.json");
const routesPath = path.resolve(__dirname, "../public/data/routes.json");

const routeConfig = [
  ["simulation-enumeration", "模拟与枚举", 6, ["模拟", "枚举", "暴力", "implementation"]],
  ["string", "字符串", 4, ["字符串", "KMP", "字典序", "string", "哈希"]],
  ["sort-struct", "排序与结构体", 4, ["排序", "结构体", "sort"]],
  ["recurrence", "递推", 4, ["递推", "递归"]],
  ["basic-dp", "基础动态规划", 7, ["动态规划", "DP", "背包", "线性 DP"]],
  ["dfs-bfs", "DFS / BFS", 7, ["DFS", "BFS", "搜索", "深度优先搜索", "广度优先搜索"]],
  ["greedy", "贪心", 5, ["贪心"]],
  ["binary-prefix", "二分与前缀和", 5, ["二分", "前缀和"]],
  ["basic-data-structure", "基础数据结构", 4, ["栈", "队列", "链表", "堆", "单调栈", "单调队列", "数据结构"]],
  ["union-graph", "并查集与图论基础", 4, ["并查集", "图论", "最短路", "树", "生成树"]],
];

const allowedDifficulty = new Set([2, 3, 4, 5]);

function scoreProblem(problem, keywords) {
  const text = `${problem.title} ${(problem.tags || []).join(" ")}`.toLowerCase();
  const hitCount = keywords.filter((keyword) => text.includes(keyword.toLowerCase())).length;
  const difficultyBonus = problem.difficulty <= 3 ? 10 : 0;
  return hitCount * 100 + difficultyBonus - problem.difficulty;
}

function problemNumber(problem) {
  return Number(String(problem.id).slice(1)) || 0;
}

function sortCandidates(a, b, keywords) {
  return (
    scoreProblem(b, keywords) - scoreProblem(a, keywords) ||
    a.difficulty - b.difficulty ||
    problemNumber(a) - problemNumber(b)
  );
}

async function readProblems() {
  try {
    const raw = await fs.readFile(problemsPath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : mockProblems;
  } catch {
    await fs.mkdir(path.dirname(problemsPath), { recursive: true });
    await fs.writeFile(problemsPath, `${JSON.stringify(mockProblems, null, 2)}\n`, "utf8");
    return mockProblems;
  }
}

async function main() {
  const allProblems = (await readProblems()).filter(
    (problem) => /^P\d+$/.test(problem.id) && allowedDifficulty.has(Number(problem.difficulty)),
  );
  const selected = new Set();
  const routes = [];

  for (const [routeId, routeName, quota, keywords] of routeConfig) {
    const exact = allProblems
      .filter((problem) => !selected.has(problem.id))
      .filter((problem) => scoreProblem(problem, keywords) >= 100)
      .sort((a, b) => sortCandidates(a, b, keywords));

    const nearKeywords = routeConfig
      .filter(([, name]) => name !== routeName)
      .flatMap(([, , , words]) => words);
    const fallback = allProblems
      .filter((problem) => !selected.has(problem.id))
      .filter((problem) => !exact.some((item) => item.id === problem.id))
      .filter((problem) => scoreProblem(problem, nearKeywords) >= 100)
      .sort((a, b) => a.difficulty - b.difficulty || problemNumber(a) - problemNumber(b));

    const picked = [...exact, ...fallback].slice(0, quota);
    picked.forEach((problem) => selected.add(problem.id));
    picked.sort((a, b) => a.difficulty - b.difficulty || problemNumber(a) - problemNumber(b));
    routes.push({ routeId, routeName, problems: picked.map((problem) => problem.id) });
  }

  const total = routes.reduce((sum, route) => sum + route.problems.length, 0);
  if (total < 50) {
    console.warn(`Only generated ${total} route problems. Add more source problems to reach 50.`);
  }

  await fs.mkdir(path.dirname(routesPath), { recursive: true });
  await fs.writeFile(routesPath, `${JSON.stringify(routes, null, 2)}\n`, "utf8");
  console.log(`Wrote ${total} route problems to ${routesPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
