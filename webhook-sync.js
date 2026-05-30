const http = require("http");
const { execSync } = require("child_process");
const SmeeClient = require("smee-client");

const PROJECT_DIR = __dirname;
const PORT = 9000;
const SMEE_URL = "https://smee.io/KoihgecLPmgFPZny";

const smee = new SmeeClient({ source: SMEE_URL, target: `http://localhost:${PORT}`, logger: console });
smee.start();

const server = http.createServer((req, res) => {
  if (req.method !== "POST") {
    res.writeHead(405);
    res.end();
    return;
  }

  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    const event = req.headers["x-github-event"];
    if (event === "push") {
      console.log("[webhook] push event received — running git pull");
      try {
        const output = execSync("git pull", { cwd: PROJECT_DIR, encoding: "utf8" });
        console.log(output);
      } catch (err) {
        console.error("[webhook] git pull failed:", err.message);
      }
    }
    res.writeHead(200);
    res.end("ok");
  });
});

server.listen(PORT, () => {
  console.log(`[webhook] listening on http://localhost:${PORT}`);
});
