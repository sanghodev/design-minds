import type { NextConfig } from "next";
import { existsSync, watch } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function runGeminiSync() {
  try {
    execSync("node scripts/sync-gemini-registry.mjs", { stdio: "inherit", cwd: root });
  } catch (err) {
    console.error("Warning: Gemini registry auto-sync failed:", err);
  }
}

// Always ensure registries are up to date when Next.js boots
runGeminiSync();

// In development mode, watch experiments/gemini directory to automatically pick up newly created days
if (process.env.NODE_ENV !== "production") {
  const geminiRoot = join(root, "experiments", "gemini");
  if (existsSync(geminiRoot)) {
    let debounceTimer: NodeJS.Timeout;
    try {
      watch(geminiRoot, { recursive: true }, (eventType, filename) => {
        if (filename && (filename.endsWith(".json") || filename.endsWith(".tsx"))) {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            console.log(`[Auto-Sync] Detected change in ${filename}, updating Gemini registry...`);
            runGeminiSync();
          }, 300);
        }
      });
    } catch {
      // Ignored if file watch is not supported by host system
    }
  }
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

