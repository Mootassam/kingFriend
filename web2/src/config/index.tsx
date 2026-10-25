// Same-origin /api: nginx proxies it to the backend container, avoiding mixed-content blocks on https.
// Override with VITE_API_URL (e.g. http://localhost:8082/api for a local server).
const config = {
  backendUrl: import.meta.env.VITE_API_URL || "/api",

};

export default config;
