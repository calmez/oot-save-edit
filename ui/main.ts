import { Webview } from "@webview/webview";
import { dirname, join } from "@std/path";

const worker = new Worker(
  join(dirname(import.meta.url), "server.ts"),
  { type: "module" },
);

const webview = new Webview(true);
webview.title = "oot-save-edit";

webview.bind("exit", () => {
  webview.destroy();
  Deno.exit();
});

webview.navigate(`http://127.0.0.1:8000`);

webview.run();
worker.terminate();
Deno.exit();
