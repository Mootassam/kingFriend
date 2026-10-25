export default (app) => {
  // Public: forex and crypto headlines gathered from public RSS feeds.
  app.get(`/news`, require("./newsList").default);
};
