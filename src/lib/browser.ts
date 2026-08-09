import puppeteer, { type Browser } from "puppeteer-core";
import { findChromeExecutable } from "@/lib/chrome";

/**
 * Serverless hosts (Vercel, Netlify, Lambda) have no browser installed, so the
 * export there runs a Chromium build packaged for those runtimes. Locally we
 * reuse whatever Chrome is already on the machine, which keeps the dev install
 * small and startup fast.
 */
function isServerless(): boolean {
  return Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL || process.env.NETLIFY);
}

export class BrowserUnavailableError extends Error {}

export async function launchBrowser(): Promise<Browser> {
  if (isServerless()) {
    // Imported lazily so local development never loads the ~50 MB binary pack.
    const chromium = (await import("@sparticuz/chromium")).default;
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const executablePath = findChromeExecutable();
  if (!executablePath) {
    throw new BrowserUnavailableError(
      "No Chrome or Chromium binary was found. Install Chrome, or set PUPPETEER_EXECUTABLE_PATH, or use the Print button instead.",
    );
  }

  return puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
}
