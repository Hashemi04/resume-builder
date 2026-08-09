import { accessSync, constants } from "node:fs";

const CANDIDATES = [
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/snap/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

/** Reuses an already installed browser so no Chromium download is needed. */
export function findChromeExecutable(): string | null {
  const configured = process.env.PUPPETEER_EXECUTABLE_PATH?.trim();
  const paths = configured ? [configured, ...CANDIDATES] : CANDIDATES;

  for (const path of paths) {
    try {
      accessSync(path, constants.X_OK);
      return path;
    } catch {
      // Try the next candidate.
    }
  }
  return null;
}
