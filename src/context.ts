import * as vscode from "vscode";
import { declaresOpenApi } from "./spec";

const CONTEXT_KEY = "swaggerViewer.isOpenApiEditor";

/** Keeps the `swaggerViewer.isOpenApiEditor` context key in sync with the active editor. */
export function trackOpenApiEditor(): vscode.Disposable {
  const update = () => {
    const document = vscode.window.activeTextEditor?.document;
    void vscode.commands.executeCommand("setContext", CONTEXT_KEY, !!document && declaresOpenApi(document.getText()));
  };
  update();
  return vscode.Disposable.from(
    vscode.window.onDidChangeActiveTextEditor(update),
    vscode.workspace.onDidChangeTextDocument(event => {
      if (event.document === vscode.window.activeTextEditor?.document) {
        update();
      }
    })
  );
}
