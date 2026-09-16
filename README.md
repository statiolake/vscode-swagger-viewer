# Swagger Viewer

Live [Swagger UI](https://github.com/swagger-api/swagger-ui) preview for OpenAPI 3 / Swagger 2 documents written in YAML or JSON.

## Usage

1. Open an OpenAPI / Swagger `.yaml`, `.yml` or `.json` file.
2. Run **Swagger Viewer: Open Preview to the Side** (`Shift+Alt+P`), or click the preview icon in the editor title bar.

The preview follows your edits as you type. When the document cannot be parsed, the error is shown
at the top of the preview and the last valid rendering stays visible until the document parses again.

## Commands

| Command | Description |
| --- | --- |
| `Swagger Viewer: Open Preview` | Open the preview in the current editor group |
| `Swagger Viewer: Open Preview to the Side` | Open the preview beside the editor |

## Limitations

- External `$ref`s pointing to other local files are not resolved.
- "Try it out" requests are sent from the webview and are subject to the target server's CORS policy.

## Development

```sh
npm install
npm run build   # or press F5 in VS Code
npm test
```

Release to both the Visual Studio Marketplace and Open VSX:

```sh
npx vsce login statiolake     # once
export OVSX_PAT=...           # Open VSX access token
npm run publish
```

## License

MIT. Swagger UI is bundled under the Apache License 2.0 (see `media/swagger-ui/LICENSE` in the package).
