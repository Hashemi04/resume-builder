import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Both packages ship or locate native binaries at runtime, so they have to be
   * required from node_modules instead of being bundled into the server build.
   * Without this the PDF route cannot find Chromium once deployed.
   */
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
};

export default nextConfig;
