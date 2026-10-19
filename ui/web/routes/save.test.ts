import { assertEquals, assertStringIncludes } from "@std/assert";
import { App } from "fresh";

import { SraSaveFile, SrmSaveFile } from "../../../models/savefile.ts";
import { FileFormat, FileUtil } from "../../../utils/fileutil.ts";
import type { State } from "../utils.ts";
import { handler } from "./save.tsx";

for (const format of [FileFormat.SRA, FileFormat.SRM]) {
  Deno.test(`web ${FileFormat[format]} uploads use recognized data across filename extensions`, async () => {
    const app = new App<State>().route("/save", { handler });
    const bytes = FileUtil.getFileData(new SraSaveFile(), format);
    const ext = format === FileFormat.SRA ? "sra" : "srm";
    const opposite = format === FileFormat.SRA ? "srm" : "sra";
    for (
      const filename of [
        `game.${ext}`,
        `game.${ext.toUpperCase()}`,
        `game.${opposite}`,
        "game",
        "game.bin",
      ]
    ) {
      const form = new FormData();
      form.set("action", "load");
      form.set("save", new File([new Uint8Array(bytes)], filename));
      const response = await app.handler()(
        new Request("http://localhost/save", { method: "POST", body: form }),
      );
      assertEquals(response.status, 200);
      const html = await response.text();
      assertStringIncludes(html, `download="game.${ext}"`);
      assertEquals(
        html.includes("disagrees with the recognized"),
        filename === `game.${opposite}`,
      );
      assertStringIncludes(html, "Player Name");
      const downloadUrl = html.match(/href="(blob:[^"]+)"/)?.[1];
      if (!downloadUrl) throw new Error("Save download is missing.");
      try {
        assertEquals(
          new Uint8Array(await (await fetch(downloadUrl)).arrayBuffer()),
          bytes,
        );
      } finally {
        URL.revokeObjectURL(downloadUrl);
      }
    }
  });
}

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

for (const format of ["sra", "srm"]) {
  Deno.test(`web ${format} upload renders unresolved input without an editor or download`, async () => {
    const app = new App<State>().route("/save", { handler });
    const form = new FormData();
    form.set("action", "load");
    const bytes = new Uint8Array(
      format === "sra" ? SraSaveFile.acceptedSize : SrmSaveFile.acceptedSize,
    );
    form.set("save", new File([bytes], `ambiguous.${format}`));
    const response = await app.handler()(
      new Request("http://localhost/save", { method: "POST", body: form }),
    );
    assertEquals(response.status, 200);
    const html = await response.text();
    assertStringIncludes(html, "Choose input byte order");
    assertStringIncludes(html, "Cancel");
    assertEquals(html.includes("blob:"), false);
    assertEquals(html.includes("Player Name"), false);
  });
}
