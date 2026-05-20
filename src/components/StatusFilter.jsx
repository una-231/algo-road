import StatusSquare from "./StatusSquare.jsx";

const options = [
  ["unknown", "未开始"],
  ["green", "成功 AC"],
  ["yellow", "不熟"],
  ["red", "一点不会"],
];

export default function StatusFilter({ value, onChange }) {
  const selected = new Set(value);

  function toggle(status) {
    const next = new Set(selected);
    if (next.has(status)) next.delete(status);
    else next.add(status);
    onChange([...next]);
  }

  return (
    <div className="status-filter">
      {options.map(([status, label]) => (
        <label className="check-pill" key={status}>
          <input
            type="checkbox"
            checked={selected.has(status)}
            onChange={() => toggle(status)}
          />
          <StatusSquare status={status} />
          <span>{label}</span>
        </label>
      ))}
    </div>
  );
}
