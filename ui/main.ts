import { Webview } from "@webview/webview";

const worker = new Worker(
  import.meta.resolve("./server.ts"),
  { type: "module" },
);

const webview = new Webview(true);
webview.title = "oot-save-edit";

webview.bind("exit", () => {
  webview.destroy();
  worker.terminate();
  Deno.exit();
});

webview.navigate(`http://127.0.0.1:8000`);

webview.run();
worker.terminate();
Deno.exit();
