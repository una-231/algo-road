import { Link } from "react-router-dom";

const entries = [
  ["/route", "精选 50 题路线", "按模块推进，适合复试前系统刷一轮。"],
  ["/knowledge", "按知识点刷题", "从标签入口进入，集中练某一类题。"],
  ["/problems", "完整题库浏览", "搜索、筛选、查状态，一页完成。"],
  ["/review", "今日复习", "优先处理不会和不熟的题。"],
  ["/stats", "统计分析", "查看 50 题或完整题库的完成情况。"],
  ["/data", "数据导入 / 导出", "备份或恢复本地刷题记录。"],
];

export default function Home() {
  return (
    <section>
      <div className="hero">
        <div>
          <h1>洛谷刷题助手</h1>
          <p>本地运行、离线读题库、记录存在浏览器里，专注把题刷明白。</p>
        </div>
      </div>
      <div className="home-grid">
        {entries.map(([to, title, desc]) => (
          <Link className="entry-card" to={to} key={to}>
            <strong>{title}</strong>
            <span>{desc}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
