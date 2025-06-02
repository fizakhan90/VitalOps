const nextConfig = {
  output: 'export',
  // If your FastAPI serves it from root, no basePath/assetPrefix needed.
  // If from a subpath like /dashboard, you'd set:
  // basePath: '/dashboard',
  // assetPrefix: '/dashboard', // Ensures CSS/JS links are correct
};
export default nextConfig;