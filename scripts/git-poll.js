import { exec } from "child_process";
import { triggerReload } from "./static-server.js";

process.chdir("/app"); // 🔑 FORCE correct git root

const BRANCH = process.env.PREVIEW_BRANCH || "main";
let lastSha = null;

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: "/app" }, (err, stdout) => {
      if (err) return reject(err.message);
      resolve(stdout.trim());
    });
  });
}

export async function startGitPoll() {
  console.log("[git-poll] started");

  async function poll() {
    try {
      await run(`git fetch --depth=1 origin ${BRANCH}`);
      const sha = await run(`git rev-parse origin/${BRANCH}`);

      if (sha !== lastSha) {
        console.log("[git-poll] update detected");
        await run(`git reset --hard origin/${BRANCH}`);
        lastSha = sha;
        triggerReload();
      }
    } catch (e) {
      console.error("[git-poll]", e);
    }

    setTimeout(poll, 2000);
  }

  poll();
}
