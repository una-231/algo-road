export const statuses = ["unknown", "green", "yellow", "red"];

export function calculateStats(problems, userRecords) {
  const counts = { total: problems.length, unknown: 0, green: 0, yellow: 0, red: 0 };
  for (const problem of problems) {
    const status = userRecords[problem.id]?.status || "unknown";
    counts[statuses.includes(status) ? status : "unknown"] += 1;
  }
  counts.done = counts.green + counts.yellow + counts.red;
  return counts;
}
