import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { i18n, init as i18nInit } from "./i18n";

(async function () {
  await i18nInit();

  document.title = i18n("app.title");
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
})();
