export const STORAGE_KEY = "luogu-study-helper-records";

export function getUserRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function saveUserRecord(problemId, record) {
  const records = getUserRecords();
  const previous = records[problemId] || {};
  records[problemId] = {
    ...previous,
    ...record,
    lastUpdated: record.lastUpdated || new Date().toISOString().slice(0, 10),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records, null, 2));
  window.dispatchEvent(new Event("records-updated"));
  return records[problemId];
}

export function getProblemStatus(problemId) {
  return getUserRecords()[problemId]?.status || "unknown";
}

export function exportUserRecords() {
  const data = JSON.stringify(getUserRecords(), null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `luogu-study-records-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function importUserRecords(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new Error("导入文件必须是对象格式");
        }
        for (const [id, record] of Object.entries(parsed)) {
          if (!/^P\d+$/.test(id) || !record || typeof record !== "object") {
            throw new Error("导入数据格式不正确");
          }
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed, null, 2));
        window.dispatchEvent(new Event("records-updated"));
        resolve(parsed);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsText(file, "utf8");
  });
}

export function clearUserRecords() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("records-updated"));
}
