import { BookOpen, ChartNoAxesColumn, Database, Layers, ListChecks, RefreshCcw } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  ["/", "50 题路线", ListChecks],
  ["/knowledge", "知识点", Layers],
  ["/problems", "题库", BookOpen],
  ["/review", "今日复习", RefreshCcw],
  ["/stats", "统计", ChartNoAxesColumn],
  ["/data", "数据", Database],
];

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/" className="brand">
          洛谷刷题助手
        </NavLink>
        <nav className="nav">
          {navItems.map(([to, label, Icon]) => (
            <NavLink className="nav-link" to={to} key={to} end={to === "/"}>
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="page">{children}</main>
    </div>
  );
}
