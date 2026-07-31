const { createProxyMiddleware } = require("http-proxy-middleware");

/** Dev-only: proxy /api to FastAPI so the frontend works when the backend restarts. */
module.exports = function setupProxy(app) {
  const target = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";
  app.use(
    "/api",
    createProxyMiddleware({
      target,
      changeOrigin: true,
    }),
  );
};
