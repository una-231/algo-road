import { Link } from "react-router-dom";
import { getProblemStatus } from "../utils/storage.js";
import StatusSquare from "./StatusSquare.jsx";

export default function ProblemRow({ problem, record, compact = false }) {
  const status = record?.status || getProblemStatus(problem.id);
  return (
    <div className={`problem-row ${compact ? "compact" : ""}`}>
      <div className="problem-main">
        <Link className="problem-id" to={`/problem/${problem.id}`}>
          {problem.id}
        </Link>
        <Link className="problem-title" to={`/problem/${problem.id}`}>
          {problem.title}
        </Link>
        <span className="difficulty">{problem.difficultyName}</span>
      </div>
      {!compact ? (
        <div className="tags">
          {(problem.tags || []).slice(0, 5).map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      <StatusSquare status={status} />
    </div>
  );
}
