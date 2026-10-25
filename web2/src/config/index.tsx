// Same API the PC app uses; override with VITE_API_URL (e.g. http://localhost:8082/api for a local server).
const config = {
  backendUrl: import.meta.env.VITE_API_URL || "https://pc.indiaallvorafx.cc/api",

};

export default config;
