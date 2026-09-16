import * as vscode from "vscode";
import { toWebviewMessage } from "./preview-message";

const UPDATE_DELAY_MS = 300;

export class SwaggerPreviewManager implements vscode.Disposable {
  private readonly panels = new Map<string, SwaggerPreview>();

  constructor(private readonly extensionUri: vscode.Uri) {}

  async open(uri: vscode.Uri | undefined, column: vscode.ViewColumn): Promise<void> {
    const target = uri ?? vscode.window.activeTextEditor?.document.uri;
    if (!target) {
      throw new Error("Swagger Viewer: open a YAML or JSON file to preview.");
    }
    const document = await vscode.workspace.openTextDocument(target);
    const key = document.uri.toString();
    const existing = this.panels.get(key);
    if (existing) {
      existing.reveal(column);
      return;
    }
    const preview = new SwaggerPreview(this.extensionUri, document, column, () => this.panels.delete(key));
    this.panels.set(key, preview);
  }

  dispose(): void {
    for (const preview of [...this.panels.values()]) {
      preview.dispose();
    }
  }
}

class SwaggerPreview implements vscode.Disposable {
  private readonly panel: vscode.WebviewPanel;
  private readonly disposables: vscode.Disposable[] = [];
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly document: vscode.TextDocument,
    column: vscode.ViewColumn,
    onDispose: () => void
  ) {
    const mediaRoot = vscode.Uri.joinPath(extensionUri, "media");
    this.panel = vscode.window.createWebviewPanel(
      "swaggerViewer.preview",
      `Swagger: ${fileName(document.uri)}`,
      column,
      { enableScripts: true, retainContextWhenHidden: true, localResourceRoots: [mediaRoot] }
    );
    this.panel.webview.html = this.html();
    this.disposables.push(
      this.panel.webview.onDidReceiveMessage((message: { type: string }) => {
        if (message.type === "ready") {
          this.update();
        }
      }),
      vscode.workspace.onDidChangeTextDocument(event => {
        if (event.document.uri.toString() === this.document.uri.toString()) {
          this.scheduleUpdate();
        }
      }),
      this.panel.onDidDispose(() => {
        this.dispose();
        onDispose();
      })
    );
  }

  reveal(column: vscode.ViewColumn): void {
    this.panel.reveal(column);
  }

  dispose(): void {
    clearTimeout(this.timer);
    for (const disposable of this.disposables.splice(0)) {
      disposable.dispose();
    }
    this.panel.dispose();
  }

  private scheduleUpdate(): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.update(), UPDATE_DELAY_MS);
  }

  private update(): void {
    void this.panel.webview.postMessage(toWebviewMessage(this.document.getText()));
  }

  private html(): string {
    const webview = this.panel.webview;
    const media = (...path: string[]) => webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "media", ...path));
    const nonce = createNonce();
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https: data:; style-src ${webview.cspSource} 'unsafe-inline'; font-src ${webview.cspSource}; script-src 'nonce-${nonce}'; connect-src https: http:;">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${media("swagger-ui", "swagger-ui.css")}">
  <link rel="stylesheet" href="${media("preview.css")}">
</head>
<body>
  <div id="error" hidden></div>
  <div id="swagger-ui"></div>
  <script nonce="${nonce}" src="${media("swagger-ui", "swagger-ui-bundle.js")}"></script>
  <script nonce="${nonce}" src="${media("preview.js")}"></script>
</body>
</html>`;
  }
}

function fileName(uri: vscode.Uri): string {
  return uri.path.split("/").pop() ?? uri.path;
}

function createNonce(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
