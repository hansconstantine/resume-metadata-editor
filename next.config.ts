import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/resume-metadata-editor" : "",
  assetPrefix: isProd ? "/resume-metadata-editor/" : "",
};

export default nextConfig;
