import { getStatusColor, getStatusLabel } from "../utils/problemUtils.js";

export default function StatusSquare({ status = "unknown", withLabel = false }) {
  return (
    <span className="status-wrap" title={getStatusLabel(status)}>
      <span className="status-square" style={{ backgroundColor: getStatusColor(status) }} />
      {withLabel ? <span>{getStatusLabel(status)}</span> : null}
    </span>
  );
}
