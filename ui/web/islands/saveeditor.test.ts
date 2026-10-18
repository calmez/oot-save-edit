import { assertEquals, assertExists } from "@std/assert";
import { h } from "preact";
import { renderToString } from "preact-render-to-string";
import { SraSaveFile, SrmSaveFile } from "../../../models/savefile.ts";
import { SaveSlot } from "../../../models/saveslot.ts";
import { FileFormat } from "../../../utils/fileutil.ts";
import SaveEditor from "./SaveEditor.tsx";

for (const format of [FileFormat.SRA, FileFormat.SRM]) {
  Deno.test(`rendering the ${FileFormat[format]} editor preserves damaged checksums in its findings and eager download`, async () => {
    const source = new SraSaveFile();
    for (const slot of [...source.slots, ...source.backups]) {
      slot.data.set(SaveSlot.createNewGame().data);
    }
    source.slots[1].checksum ^= 0x1234;
    source.backups[0].checksum ^= 0x4321;
    const original = format === FileFormat.SRA
      ? source.getData()
      : SrmSaveFile.fromSaveFile(source).getData();
    const html = renderToString(h(SaveEditor, {
      filename: `damaged.${FileFormat[format].toLowerCase()}`,
      initialSaveData: original,
      detectedFormat: format,
      isByteSwapped: format === FileFormat.SRM,
    }));
    const downloadUrl = html.match(/href="(blob:[^"]+)"/)?.[1];
    assertExists(downloadUrl);
    try {
      const response = await fetch(downloadUrl);
      assertEquals(new Uint8Array(await response.arrayBuffer()), original);
      const validity = Array.from(
        html.matchAll(/File Valid<\/span>[\s\S]*?<input\b([^>]*)/g),
        (match) => /\bchecked(?:=|\s|$)/.test(match[1]),
      );
      assertEquals(validity, [true, false, true, false, true, true]);
    } finally {
      URL.revokeObjectURL(downloadUrl);
    }
  });
}
