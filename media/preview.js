// @ts-check
(function () {
  const vscode = acquireVsCodeApi();
  const errorBanner = /** @type {HTMLElement} */ (document.getElementById("error"));

  // The one place errors become visible. The banner always shows the most recent
  // failure and is cleared only when a newer render succeeds.
  function showError(message) {
    errorBanner.textContent = message;
    errorBanner.hidden = false;
  }

  window.addEventListener("error", event => showError(String(event.error ?? event.message)));
  window.addEventListener("unhandledrejection", event => showError(String(event.reason)));

  window.addEventListener("message", event => {
    const message = event.data;
    switch (message.type) {
      case "render":
        // @ts-ignore SwaggerUIBundle is provided by swagger-ui-bundle.js
        SwaggerUIBundle({ spec: message.spec, dom_id: "#swagger-ui", deepLinking: false });
        errorBanner.hidden = true;
        break;
      case "error":
        showError(message.message);
        break;
      default:
        throw new Error(`Unknown message type: ${message.type}`);
    }
  });

  vscode.postMessage({ type: "ready" });
})();
