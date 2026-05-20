import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve("dist");
const indexPath = path.join(distDir, "index.html");
const fallbackPath = path.join(distDir, "404.html");

if (!fs.existsSync(indexPath)) {
  throw new Error("dist/index.html not found. Run npm run build first.");
}

fs.copyFileSync(indexPath, fallbackPath);
console.log("Created dist/404.html for static SPA fallback.");
