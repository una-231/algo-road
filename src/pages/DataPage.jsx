import { useState } from "react";
import { clearUserRecords, exportUserRecords, importUserRecords } from "../utils/storage.js";

export default function DataPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    if (!window.confirm("导入会覆盖当前本地记录，确定继续吗？")) return;
    try {
      await importUserRecords(file);
      setMessage("导入成功。");
    } catch (err) {
      setError(err.message || "导入失败。");
    } finally {
      event.target.value = "";
    }
  }

  function handleClear() {
    if (!window.confirm("确定要清空本地记录吗？")) return;
    if (!window.confirm("清空后无法恢复，确认清空？")) return;
    clearUserRecords();
    setMessage("本地记录已清空。");
    setError("");
  }

  return (
    <section>
      <div className="card">
        <h1>数据导入 / 导出</h1>
        <p>记录保存在当前浏览器的 localStorage 中，建议定期导出备份。</p>
        <div className="actions">
          <button className="primary" onClick={exportUserRecords}>导出 JSON 文件</button>
          <label className="button file-button">
            导入 JSON 文件
            <input type="file" accept="application/json,.json" onChange={handleImport} />
          </label>
          <button className="danger" onClick={handleClear}>清空本地记录</button>
        </div>
        {message ? <p className="success">{message}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
      </div>
    </section>
  );
}
