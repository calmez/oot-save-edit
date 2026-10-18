import { assertEquals, assertStringIncludes } from "@std/assert";
import { App } from "fresh";

import { FileUtil } from "../../../utils/fileutil.ts";
import type { State } from "../utils.ts";
import { handler } from "./save.tsx";

Deno.test("web new-file creation shows one new-game pair and four empty slots", async () => {
  const app = new App<State>().route("/save", {
    handler,
  });
  const form = new FormData();
  form.set("action", "create");
  const response = await app.handler()(
    new Request("http://localhost/save", {
      method: "POST",
      body: form,
    }),
  );
  assertEquals(response.status, 200);
  const html = await response.text();
  assertEquals(html.match(/Empty slot/g)?.length, 4);
  assertStringIncludes(html, "Create new-game slot");
  const downloadUrl = html.match(/href="(blob:[^"]+)"/)?.[1];
  if (!downloadUrl) throw new Error("New save download is missing.");
  const download = await fetch(downloadUrl);
  const save = FileUtil.loadFileFromBuffer(
    new Uint8Array(await download.arrayBuffer()),
  );
  URL.revokeObjectURL(downloadUrl);
  assertEquals(save.slots.map((slot) => slot.isEmpty), [false, true, true]);
  assertEquals(save.backups.map((slot) => slot.isEmpty), [false, true, true]);
});
