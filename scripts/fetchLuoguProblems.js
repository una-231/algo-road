import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import os from "node:os";
import { mockProblems } from "./mockProblems.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(__dirname, "../public/data/problems.json");
const execFileAsync = promisify(execFile);
const cookieJarPath = path.join(os.tmpdir(), `luogu-study-helper-${process.pid}.cookies.txt`);
let tagMap = new Map();

const knowledgeTags = new Set([
  "模拟",
  "枚举",
  "暴力",
  "字符串",
  "KMP",
  "字典序",
  "哈希",
  "字符串哈希",
  "排序",
  "结构体",
  "递推",
  "递归",
  "动态规划 DP",
  "线性 DP",
  "背包 DP",
  "树形 DP",
  "状压 DP",
  "区间 DP",
  "数位 DP",
  "记忆化搜索",
  "搜索",
  "深度优先搜索 DFS",
  "广度优先搜索 BFS",
  "贪心",
  "二分",
  "三分",
  "前缀和",
  "差分",
  "双指针 two-pointer",
  "离散化",
  "分治",
  "倍增",
  "位运算",
  "数学",
  "数论",
  "组合数学",
  "容斥原理",
  "素数判断,质数,筛法",
  "最大公约数 gcd",
  "高精度",
  "概率论,统计",
  "博弈论",
  "构造",
  "Ad-hoc",
  "分类讨论",
  "图论",
  "图论建模",
  "最短路",
  "生成树",
  "拓扑排序",
  "二分图",
  "强连通分量",
  "最近公共祖先 LCA",
  "树",
  "树上问题",
  "并查集",
  "基础数据结构",
  "线性数据结构",
  "栈",
  "队列",
  "链表",
  "堆",
  "单调栈",
  "单调队列",
  "树状数组",
  "线段树",
  "平衡树",
  "字典树 Trie",
  "计算几何",
]);

const tagAliases = new Map([
  ["动态规划", "动态规划 DP"],
  ["DP", "动态规划 DP"],
  ["背包", "背包 DP"],
  ["DFS", "深度优先搜索 DFS"],
  ["BFS", "广度优先搜索 BFS"],
  ["two-pointer", "双指针 two-pointer"],
  ["gcd", "最大公约数 gcd"],
  ["Trie", "字典树 Trie"],
]);

const allowedDifficulties = new Map([
  [2, "普及-"],
  [3, "普及/提高-"],
  [4, "普及+/提高"],
  [5, "提高+/省选-"],
]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizeTags(problem) {
  const tags = [
    ...(Array.isArray(problem.tags) ? problem.tags : []),
    ...(Array.isArray(problem.tagsTranslated) ? problem.tagsTranslated : []),
  ];
  return [
    ...new Set(
      tags
        .map((tag) => tagMap.get(Number(tag)) || String(tag))
        .map((tag) => tag.trim())
        .map((tag) => tagAliases.get(tag) || tag)
        .filter((tag) => knowledgeTags.has(tag)),
    ),
  ];
}

function normalizeProblem(problem) {
  const id = String(problem.pid || problem.id || problem.problemId || "").trim();
  const difficulty = Number(problem.difficulty);
  if (!/^P\d+$/.test(id) || !allowedDifficulties.has(difficulty)) return null;
  return {
    id,
    title: String(problem.title || problem.name || id),
    difficulty,
    difficultyName: allowedDifficulties.get(difficulty),
    tags: normalizeTags(problem),
    url: `https://www.luogu.com.cn/problem/${id}`,
  };
}

async function requestJson(url) {
  const headers = {
    accept: "application/json, text/plain, */*",
    "user-agent": "Mozilla/5.0 luogu-study-helper/1.0 local data fetcher",
    referer: "https://www.luogu.com.cn/problem/list",
    "x-lentille-request": "content-only",
  };
  const shouldUseCookie = process.env.LUOGU_USE_COOKIE === "1" && process.env.LUOGU_COOKIE;
  if (shouldUseCookie) {
    headers.cookie = process.env.LUOGU_COOKIE;
  }

  return requestJsonWithCurl(url, headers);
}

async function requestJsonWithCurl(url, headers) {
  const args = [
    "-L",
    "--silent",
    "--show-error",
    "--fail",
    "--compressed",
    "--max-time",
    "30",
    "-c",
    cookieJarPath,
    "-b",
    cookieJarPath,
    "-H",
    `Accept: ${headers.accept}`,
    "-H",
    `User-Agent: ${headers["user-agent"]}`,
    "-H",
    `Referer: ${headers.referer}`,
    "-H",
    `x-lentille-request: ${headers["x-lentille-request"]}`,
  ];
  if (headers.cookie) {
    args.push("-H", `Cookie: ${headers.cookie}`);
  }
  args.push(url);

  try {
    const { stdout } = await execFileAsync("curl.exe", args, {
      maxBuffer: 20 * 1024 * 1024,
      windowsHide: true,
    });
    return JSON.parse(stdout);
  } catch (curlError) {
    throw new Error(sanitizeError(curlError.message));
  }
}

function sanitizeError(message) {
  return String(message).replace(/Cookie: [^\r\n]+/gi, "Cookie: [hidden]");
}

function pickProblemArray(payload) {
  return (
    payload?.currentData?.problems?.result ||
    payload?.currentData?.problems ||
    payload?.problems?.result ||
    payload?.problems ||
    payload?.data?.problems?.result ||
    []
  );
}

function pickTotalPage(payload, currentPage) {
  const source = payload?.currentData?.problems || payload?.data?.problems || payload?.problems || payload;
  const perPage = Number(source?.perPage || 50);
  const count = Number(source?.count || 0);
  if (count > 0 && perPage > 0) return Math.ceil(count / perPage);
  return currentPage + 1;
}

async function fetchTagMap() {
  try {
    const payload = await requestJson("https://www.luogu.com.cn/_lfe/tags");
    const tags = Array.isArray(payload?.tags) ? payload.tags : [];
    tagMap = new Map(tags.map((tag) => [Number(tag.id), String(tag.name)]));
    console.log(`Loaded ${tagMap.size} Luogu tag names`);
  } catch (error) {
    console.warn(`Tag map failed: ${error.message}. Numeric tags will be omitted.`);
    tagMap = new Map();
  }
}

async function fetchProblems() {
  await fetchTagMap();
  const problems = new Map();
  const maxPages = Number(process.env.LUOGU_MAX_PAGES || 200);
  const delay = Number(process.env.LUOGU_FETCH_DELAY_MS || 1200);

  for (const difficulty of allowedDifficulties.keys()) {
    let page = 1;
    let totalPage = 1;

    while (page <= totalPage && page <= maxPages) {
      const url = `https://www.luogu.com.cn/problem/list?type=P&difficulty=${difficulty}&page=${page}`;
      try {
        const payload = await requestJson(url);
        const list = pickProblemArray(payload);
        for (const item of list) {
          const normalized = normalizeProblem(item);
          if (normalized) problems.set(normalized.id, normalized);
        }
        totalPage = Math.max(totalPage, pickTotalPage(payload, page));
        console.log(
          `Fetched ${allowedDifficulties.get(difficulty)} page ${page}/${totalPage}, kept ${problems.size} problems`,
        );
      } catch (error) {
        console.warn(`${allowedDifficulties.get(difficulty)} page ${page} failed: ${error.message}`);
      }
      page += 1;
      await sleep(delay);
    }
  }

  return [...problems.values()].sort((a, b) => {
    const av = Number(a.id.slice(1));
    const bv = Number(b.id.slice(1));
    return av - bv;
  });
}

async function main() {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  let problems = [];
  try {
    problems = await fetchProblems();
  } catch (error) {
    console.warn(`Fetch failed: ${error.message}`);
  }

  if (problems.length === 0) {
    console.warn("No remote data was fetched. Writing mock data so the app can run.");
    problems = mockProblems;
  }

  await fs.writeFile(outputPath, `${JSON.stringify(problems, null, 2)}\n`, "utf8");
  console.log(`Wrote ${problems.length} problems to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
