import { assertEquals, assertExists } from "@std/assert";
import { parseHTML } from "npm:linkedom@0.18.12";
import { h, render } from "preact";
import { renderToString } from "preact-render-to-string";
import { act } from "preact/test-utils";

import {
  ExportByteOrder,
  SraSaveFile,
  SrmSaveFile,
} from "../../../models/savefile.ts";
import { SaveSlot } from "../../../models/saveslot.ts";
import { FileFormat, FileUtil } from "../../../utils/fileutil.ts";
import SaveEditor from "./SaveEditor.tsx";

Deno.test("web SRAM order selection controls download bytes across source orders and format changes", async () => {
  const window = parseHTML("<html><body></body></html>");
  const document = window.document as unknown as Document;
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: document,
  });
  const native = new SraSaveFile().getData();
  native.set([0x12, 0x34, 0x56, 0x78], SraSaveFile.requiredSize);
  const original = new SrmSaveFile();
  original.eeprom.set([0x12, 0x34, 0x56, 0x78]);
  original.mempacks[0].set([0x9A, 0xBC, 0xDE, 0xF0]);
  original.flashram.set([0x23, 0x45, 0x67, 0x89]);
  const container = document.body;
  async function download(): Promise<Uint8Array> {
    const anchor = container.querySelector<HTMLAnchorElement>("a[download]");
    assertExists(anchor);
    try {
      const response = await fetch(anchor.href);
      return new Uint8Array(await response.arrayBuffer());
    } finally {
      URL.revokeObjectURL(anchor.href);
    }
  }
  function select(label: string, value: string): void {
    const control = container.querySelector<HTMLSelectElement>(
      `select[aria-label="${label}"]`,
    );
    assertExists(control);
    const option = Array.from(control.querySelectorAll("option"))
      .find((option) => option.value === value);
    assertExists(option);
    option.selected = true;
    control.dispatchEvent(new window.Event("change", { bubbles: true }));
  }
  try {
    for (const swapped of [false, true]) {
      original.sram.set(swapped ? FileUtil.byteSwap(native) : native);
      const source = original.getData();
      await act(() =>
        render(
          h(SaveEditor, {
            filename: "game.srm",
            initialSaveData: source,
            detectedFormat: FileFormat.SRM,
            isByteSwapped: swapped,
          }),
          container,
        )
      );
      assertEquals(await download(), source);
      for (
        const order of [ExportByteOrder.BigEndian, ExportByteOrder.WordSwapped]
      ) {
        await act(() => select("SRAM Byte Order", order));
        const exported = new SrmSaveFile().read(await download());
        assertEquals(exported.eeprom, original.eeprom);
        assertEquals(exported.mempacks, original.mempacks);
        assertEquals(exported.flashram, original.flashram);
        assertEquals(
          exported.sram.subarray(
            SraSaveFile.requiredSize,
            SraSaveFile.requiredSize + 4,
          ),
          new Uint8Array(
            order === ExportByteOrder.BigEndian
              ? [0x12, 0x34, 0x56, 0x78]
              : [0x78, 0x56, 0x34, 0x12],
          ),
        );
      }
      await act(() => select("File Format", String(FileFormat.SRA)));
      assertEquals(
        (await download()).subarray(
          SraSaveFile.requiredSize,
          SraSaveFile.requiredSize + 4,
        ),
        new Uint8Array([0x78, 0x56, 0x34, 0x12]),
      );
      await act(() => select("SRAM Byte Order", ExportByteOrder.Automatic));
      assertEquals(await download(), native);
      await act(() => render(null, container));
    }
  } finally {
    await act(() => render(null, container));
    if (descriptor) Object.defineProperty(globalThis, "document", descriptor);
    else Reflect.deleteProperty(globalThis, "document");
  }
});

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
