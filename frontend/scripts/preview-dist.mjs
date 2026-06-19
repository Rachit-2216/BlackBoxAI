import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../dist");
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";

const contentTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".ico": "image/x-icon",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain",
  ".webp": "image/webp",
};

function resolveFile(urlPath) {
  const decodedPath = decodeURIComponent(urlPath);
  const candidate = path.resolve(root, decodedPath.replace(/^\/+/, ""));

  if (!candidate.startsWith(root)) {
    return null;
  }

  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return candidate;
  }

  return path.join(root, "index.html");
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url || "/", `http://${host}:${port}`);
  const file = resolveFile(requestUrl.pathname);

  if (!file) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  const type = contentTypes[path.extname(file)] || "application/octet-stream";
  response.writeHead(200, { "Content-Type": type });
  fs.createReadStream(file).pipe(response);
});

server.listen(port, host, () => {
  console.log(`BlackBoxAI preview http://${host}:${port}/`);
});
