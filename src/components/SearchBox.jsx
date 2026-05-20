export default function SearchBox({ value, onChange, placeholder = "搜索题号或题名" }) {
  return (
    <input
      className="search-box"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  );
}
