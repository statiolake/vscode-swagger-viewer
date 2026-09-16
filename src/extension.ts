import * as vscode from "vscode";
import { SwaggerPreviewManager } from "./preview";

export function activate(context: vscode.ExtensionContext): void {
  const previews = new SwaggerPreviewManager(context.extensionUri);
  context.subscriptions.push(
    previews,
    vscode.commands.registerCommand("swaggerViewer.openPreview", (uri?: vscode.Uri) =>
      previews.open(uri, vscode.ViewColumn.Active)
    ),
    vscode.commands.registerCommand("swaggerViewer.openPreviewToSide", (uri?: vscode.Uri) =>
      previews.open(uri, vscode.ViewColumn.Beside)
    )
  );
}

export function deactivate(): void {}
