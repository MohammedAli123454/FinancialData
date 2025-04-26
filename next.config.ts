// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;

// next.config.js

import { NextConfig } from "next";
import { Configuration } from "webpack";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";

const nextConfig: NextConfig = {
  webpack(config: Configuration) {
    config.resolve!.plugins = config.resolve!.plugins || [];
    config.resolve!.plugins.push(
      new TsconfigPathsPlugin({ configFile: "./tsconfig.json" })
    );
    return config;
  },
};

export default nextConfig;
