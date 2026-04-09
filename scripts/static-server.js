import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const PORT = process.env.PORT || 8080;
const ROOT = process.cwd(); // /app

const clients = new Set();

const server = http.createServer((req, res) => {
  // SSE endpoint for reload
  if (req.url === "/__hmr") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write("\n");

    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }

  // Serve static files
  let filePath = path.join(
    ROOT,
    req.url === "/" ? "index.html" : req.url
  );

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end();
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      return res.end("Not found");
    }

    res.writeHead(200);
    res.end(content);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[static] serving ${ROOT} on ${PORT}`);
});

// 🔥 reload trigger
export function triggerReload() {
  for (const res of clients) {
    res.write("data: reload\n\n");
  }
}
