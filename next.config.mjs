/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Suppress "Critical dependency" warnings from packages that use dynamic require()
    // internally (@supabase/realtime-js, @duckdb/duckdb-wasm). We cannot fix these
    // inside the packages themselves.
    config.ignoreWarnings = [
      { module: /node_modules\/@supabase\/realtime-js/ },
      { module: /node_modules\/@duckdb\/duckdb-wasm/ },
    ]
    return config
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
