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
            filename: "game.sra",
            initialSaveData: source,
            detectedFormat: FileFormat.SRM,
          }),
          container,
        )
      );
      assertEquals(await download(), source);
      assertEquals(
        container.textContent?.includes("disagrees with the recognized SRM"),
        true,
      );
      assertEquals(
        container.querySelector("a[download]")?.getAttribute("download"),
        "game.srm",
      );
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
        container.querySelector("a[download]")?.getAttribute("download"),
        "game.sra",
      );
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

Deno.test("web ambiguous input offers choices before rendering editing or download controls", () => {
  const html = renderToString(h(SaveEditor, {
    filename: "ambiguous.sra",
    initialSaveData: new Uint8Array(SraSaveFile.acceptedSize),
    detectedFormat: FileFormat.SRA,
  }));
  assertEquals(html.includes("Choose input byte order"), true);
  assertEquals(html.includes("Big-endian"), true);
  assertEquals(html.includes("Word-swapped"), true);
  assertEquals(html.includes("Cancel"), true);
  assertEquals(html.includes("a download"), false);
  assertEquals(html.includes("Player Name"), false);
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

Deno.test("web input choices preserve original SRA and SRM bytes and cancellation keeps editing closed", async () => {
  const window = parseHTML("<html><body></body></html>");
  const document = window.document as unknown as Document;
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: document,
  });
  const container = document.body;
  async function click(label: string): Promise<void> {
    const button = Array.from(container.querySelectorAll("button")).find((
      button,
    ) => button.textContent === label);
    assertExists(button);
    await act(() => {
      button.dispatchEvent(new window.Event("click", { bubbles: true }));
    });
  }
  try {
    for (const format of [FileFormat.SRA, FileFormat.SRM]) {
      const source = new Uint8Array(
        format === FileFormat.SRA
          ? SraSaveFile.acceptedSize
          : SrmSaveFile.acceptedSize,
      );
      if (format === FileFormat.SRM) {
        source[0] = 0xAB;
        source[source.length - 1] = 0xCD;
      }
      source.set(
        [0x12, 0x34, 0x56, 0x78],
        (format === FileFormat.SRA ? 0 : 0x20800) + SraSaveFile.requiredSize,
      );
      const before = source.slice();
      const props = {
        filename: format === FileFormat.SRA ? "ambiguous.srm" : "ambiguous.sra",
        initialSaveData: source,
        detectedFormat: format,
      };
      await act(() => render(h(SaveEditor, props), container));
      assertEquals(container.querySelector("a[download]"), null);
      assertEquals(
        container.textContent?.includes("disagrees with the recognized"),
        true,
      );
      for (const label of ["Big-endian", "Word-swapped (32-bit)"]) {
        await click(label);
        assertEquals(container.textContent?.includes("overridden"), true);
        assertEquals(
          container.textContent?.includes("disagrees with the recognized"),
          true,
        );
        const anchor = container.querySelector<HTMLAnchorElement>(
          "a[download]",
        );
        assertExists(anchor);
        try {
          assertEquals(
            new Uint8Array(await (await fetch(anchor.href)).arrayBuffer()),
            before,
          );
        } finally {
          URL.revokeObjectURL(anchor.href);
        }
        await click("Choose input byte order");
        assertEquals(container.querySelector("a[download]"), null);
      }
      await click("Cancel");
      assertEquals(container.textContent?.includes("Load cancelled"), true);
      assertEquals(container.querySelector("a[download]"), null);
      assertEquals(source, before);
      await act(() => render(null, container));
    }
    for (const format of [FileFormat.SRA, FileFormat.SRM]) {
      const save = new SraSaveFile();
      const source = format === FileFormat.SRA
        ? save.getData()
        : SrmSaveFile.fromSaveFile(save).getData();
      await act(() =>
        render(
          h(SaveEditor, {
            filename: `detected.${FileFormat[format].toLowerCase()}`,
            initialSaveData: source,
            detectedFormat: format,
          }),
          container,
        )
      );
      await click("Choose input byte order");
      await click(
        format === FileFormat.SRA ? "Word-swapped (32-bit)" : "Big-endian",
      );
      assertEquals(
        container.textContent?.includes(
          "Unavailable or uncertain field interpretations",
        ),
        true,
      );
      assertEquals(container.textContent?.includes("ddOnly"), true);
      const anchor = container.querySelector<HTMLAnchorElement>("a[download]");
      assertExists(anchor);
      try {
        assertEquals(
          new Uint8Array(await (await fetch(anchor.href)).arrayBuffer()),
          source,
        );
      } finally {
        URL.revokeObjectURL(anchor.href);
      }
      await click("Choose input byte order");
      await click(
        format === FileFormat.SRA ? "Big-endian" : "Word-swapped (32-bit)",
      );
      assertEquals(
        container.textContent?.includes("Cannot display this record"),
        false,
      );
      assertEquals(container.textContent?.includes("Player Name"), true);
      await act(() => render(null, container));
    }
  } finally {
    await act(() => render(null, container));
    if (descriptor) Object.defineProperty(globalThis, "document", descriptor);
    else Reflect.deleteProperty(globalThis, "document");
  }
});

Deno.test("web keeps readable fields editable and previews, declines and accepts a field replacement", async () => {
  const window = parseHTML("<html><body></body></html>");
  const document = window.document as unknown as Document;
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: document,
  });
  const save = new SraSaveFile();
  save.slots[0].data[0x3A] = 2;
  save.slots[0].data[0x24] = 255;
  save.slots[0].entranceIndex = 0xFFFFFFFF;
  save.slots[0].additionalData = {
    ...save.slots[0].additionalData,
    childEquipment: 5,
  };
  const original = save.getData();
  const container = document.body;
  async function click(text: string) {
    const button = Array.from(container.querySelectorAll("button")).find((
      button,
    ) => button.textContent === text);
    assertExists(button, text);
    await act(() => button.click());
  }
  async function download() {
    const anchor = container.querySelector<HTMLAnchorElement>("a[download]");
    assertExists(anchor);
    const response = await fetch(anchor.href);
    return new Uint8Array(await response.arrayBuffer());
  }
  try {
    await act(() =>
      render(
        h(SaveEditor, {
          filename: "partial.sra",
          initialSaveData: original,
          detectedFormat: FileFormat.SRA,
        }),
        container,
      )
    );
    assertEquals(
      container.textContent?.includes("Cannot display this record"),
      false,
    );
    assertEquals(container.textContent?.includes("magicFlag1"), true);
    const replacement = container.querySelector<HTMLInputElement>(
      'input[aria-label="Replacement for magicFlag1"]',
    );
    assertExists(replacement);
    await act(() => {
      replacement.value = "false";
      replacement.dispatchEvent(new window.Event("input", { bubbles: true }));
    });
    await click("Preview magicFlag1 replacement");
    assertEquals(await download(), original);
    await click("Decline magicFlag1 replacement");
    assertEquals(await download(), original);
    const checksums = container.querySelector<HTMLSelectElement>(
      'select[aria-label="Checksums"]',
    );
    assertExists(checksums);
    const choosePolicy = async (value: string) => {
      const option = Array.from(checksums!.querySelectorAll("option")).find((
        option,
      ) => option.value === value);
      assertExists(option);
      await act(() => {
        option.selected = true;
        checksums!.dispatchEvent(new window.Event("change", { bubbles: true }));
      });
    };
    await choosePolicy("preserve");
    await click("Preview magicFlag1 replacement");
    await click("Accept magicFlag1 replacement");
    const preserved = FileUtil.loadFileFromBuffer(await download());
    assertEquals(preserved.slots[0].checksum, save.slots[0].checksum);
    await choosePolicy("maintain-edited");
    const exported = FileUtil.loadFileFromBuffer(await download());
    assertEquals(exported.slots[0].magicFlag1, false);
    assertEquals(exported.slots[0].data[0x24], 255);
    assertEquals(exported.slots[0].entranceIndex, 0xFFFFFFFF);
    assertEquals(exported.slots[0].isChecksumValid(), true);
    const expand = Array.from(container.querySelectorAll("button")).find((
      button,
    ) => button.textContent?.includes("Show details"));
    assertExists(expand);
    await act(() => expand.click());
    assertEquals(container.textContent?.includes("Rupees"), true);
    const label = Array.from(container.querySelectorAll("span")).find((span) =>
      span.textContent === "Rupees"
    );
    const rupees = label?.parentElement?.querySelector<HTMLInputElement>(
      'input[type="number"]',
    );
    assertExists(rupees);
    Object.defineProperty(rupees, "validity", { value: { valid: true } });
    await choosePolicy("preserve");
    await act(() => {
      rupees.value = "42";
      rupees.dispatchEvent(new window.Event("input", { bubbles: true }));
    });
    const edited = FileUtil.loadFileFromBuffer(await download());
    assertEquals(edited.slots[0].rupees, 42);
    assertEquals(edited.slots[0].checksum, save.slots[0].checksum);
    assertEquals(edited.slots[0].data[0x24], 255);
    assertEquals(edited.slots[0].entranceIndex, 0xFFFFFFFF);
    assertEquals(
      container.querySelector(
        'textarea[aria-label="Saved child equipment word"]',
      ) === null,
      true,
    );
    const shield = container.querySelector<HTMLInputElement>(
      'input[aria-label="Replacement for additionalData.childEquipment.shield"]',
    );
    assertExists(shield);
    await act(() => {
      shield.value = "2";
      shield.dispatchEvent(new window.Event("input", { bubbles: true }));
    });
    await click("Preview additionalData.childEquipment.shield replacement");
    assertEquals(
      FileUtil.loadFileFromBuffer(await download()).slots[0].additionalData
        .childEquipment,
      5,
    );
    await click("Accept additionalData.childEquipment.shield replacement");
    const equipment =
      FileUtil.loadFileFromBuffer(await download()).slots[0].additionalData
        .childEquipment;
    assertEquals(equipment, 0x25);
  } finally {
    await act(() => render(null, container));
    if (descriptor) Object.defineProperty(globalThis, "document", descriptor);
    else Reflect.deleteProperty(globalThis, "document");
  }
});
