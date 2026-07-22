import type { NextConfig } from "next";

const REQ_VARS = ["DB_URL", "DB_USER", "DB_PASS", "DB_NAME"];

for (const key of REQ_VARS) {
  if (!process.env[key]) {
    console.error(`[ERROR] Missing required env variable: ${key}`);
  }
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
