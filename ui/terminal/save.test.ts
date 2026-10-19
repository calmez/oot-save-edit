import { assertEquals, assertStringIncludes } from "@std/assert";
import { stub } from "@std/testing/mock";
import { render } from "ink";
import { PassThrough } from "node:stream";
import { setImmediate } from "node:timers/promises";
import type { ReadStream, WriteStream } from "node:tty";
import { stripVTControlCharacters } from "node:util";
import { act, createElement } from "react";

import {
  ChecksumPolicy,
  ExportByteOrder,
  SraSaveFile,
  SrmSaveFile,
} from "../../models/savefile.ts";
import { FileFormat, FileUtil } from "../../utils/fileutil.ts";
import { Save } from "./save.tsx";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

interface TestEditor {
  frame: () => string;
  input: (input: string) => Promise<void>;
  resize: (rows: number) => Promise<void>;
  cleanup: () => Promise<void>;
}

async function renderEditor(
  rows: number,
  createNew = true,
  filename = "new-save.sra",
): Promise<TestEditor> {
  const stdout = Object.assign(new PassThrough(), { columns: 140, rows });
  const stdin = Object.assign(new PassThrough(), {
    isTTY: true,
    setRawMode() {
      return this;
    },
    ref() {
      return this;
    },
    unref() {
      return this;
    },
  });
  let frame = "";
  stdout.on("data", (chunk) => {
    frame = stripVTControlCharacters(chunk.toString());
  });
  let instance: ReturnType<typeof render>;
  await act(async () => {
    instance = render(
      createElement(Save, { filename, createNew }),
      {
        stdin: stdin as unknown as ReadStream,
        stdout: stdout as unknown as WriteStream,
        stderr: stdout as unknown as WriteStream,
        debug: true,
        patchConsole: false,
        exitOnCtrlC: false,
      },
    );
    await setImmediate();
  });
  return {
    frame: () => frame,
    async input(input: string) {
      await act(async () => {
        stdin.write(input);
        await setImmediate();
      });
    },
    async resize(rows: number) {
      await act(async () => {
        stdout.rows = rows;
        stdout.emit("resize");
        await setImmediate();
      });
    },
    async cleanup() {
      await act(async () => {
        instance.unmount();
        instance.cleanup();
        await setImmediate();
      });
      stdout.destroy();
      stdin.destroy();
    },
  };
}

for (const format of [FileFormat.SRA, FileFormat.SRM]) {
  Deno.test(`TUI ${FileFormat[format]} input and export defaults follow the data rather than the filename`, async () => {
    const bytes = FileUtil.getFileData(new SraSaveFile(), format);
    const before = bytes.slice();
    const open = stub(Deno, "openSync", () =>
      ({
        statSync: () => ({ size: bytes.length }),
        seekSync() {},
        readSync(buffer: Uint8Array) {
          buffer.set(bytes);
          return bytes.length;
        },
        close() {},
      }) as unknown as Deno.FsFile);
    const ext = format === FileFormat.SRA ? "sra" : "srm";
    const opposite = format === FileFormat.SRA ? "srm" : "sra";
    try {
      for (const filename of [`game.${opposite}`, "game", "game.bin"]) {
        const editor = await renderEditor(40, false, filename);
        try {
          assertStringIncludes(editor.frame(), "File Format");
          assertStringIncludes(editor.frame(), FileFormat[format]);
          assertEquals(
            editor.frame().includes("disagrees with the recognized"),
            filename === `game.${opposite}`,
          );
          await editor.input("2");
          assertStringIncludes(editor.frame(), `game.${ext}`);
          assertStringIncludes(editor.frame(), FileFormat[format]);
        } finally {
          await editor.cleanup();
        }
      }
      assertEquals(bytes, before);
    } finally {
      open.restore();
    }
  });
}

for (const format of ["sra", "srm"]) {
  Deno.test(`TUI ${format} input choices and cancellation gate editing without rereading the file`, async () => {
    const source = new Uint8Array(
      format === "sra" ? SraSaveFile.acceptedSize : SrmSaveFile.acceptedSize,
    );
    if (format === "srm") source[0] = 0xAB;
    const before = source.slice();
    const open = stub(Deno, "openSync", () =>
      ({
        statSync: () => ({ size: source.length }),
        seekSync() {},
        readSync(buffer: Uint8Array) {
          buffer.set(source);
          return source.length;
        },
        close() {},
      }) as unknown as Deno.FsFile);
    const filename = format === "sra" ? "ambiguous.srm" : "ambiguous.sra";
    const editor = await renderEditor(40, false, filename);
    try {
      assertStringIncludes(editor.frame(), "Choose input byte order");
      assertStringIncludes(editor.frame(), "disagrees with the recognized");
      assertStringIncludes(editor.frame(), "checksums passing");
      assertEquals(editor.frame().includes("Header Valid"), false);
      for (const [key, order] of [["w", "word-swapped"], ["b", "big-endian"]]) {
        await editor.input(key);
        assertStringIncludes(editor.frame(), "Filename");
        assertStringIncludes(editor.frame(), `overridden (${order})`);
        assertStringIncludes(editor.frame(), "disagrees with the recognized");
        await editor.input("\u000f");
        assertStringIncludes(editor.frame(), "Choose input byte order");
      }
      await editor.input("\u001b");
      assertStringIncludes(editor.frame(), "Load cancelled");
      assertEquals(editor.frame().includes("Filename"), false);
      assertEquals(source, before);
      assertEquals(open.calls.length, 1);
    } finally {
      await editor.cleanup();
      open.restore();
    }
  });
}

Deno.test("TUI Info page navigation stays within its own page count", async () => {
  const editor = await renderEditor(40);
  try {
    assertStringIncludes(editor.frame(), "Filename");
    const before = editor.frame().match(/page \d+(?: \/ \d+)?/)?.[0];
    await editor.input("]");
    assertEquals(
      editor.frame().match(/page \d+(?: \/ \d+)?/)?.[0],
      before,
      "The one-page Info tab must ignore the next-page key.",
    );
    assertStringIncludes(editor.frame(), "page 1 / 1");
  } finally {
    await editor.cleanup();
  }
});

Deno.test("TUI saves the selected SRAM output order", async () => {
  let written = new Uint8Array();
  const open = stub(Deno, "openSync", () =>
    ({
      writeSync(data: Uint8Array) {
        written = data.slice();
        return data.length;
      },
      close() {},
    }) as Deno.FsFile);
  const editor = await renderEditor(40);
  try {
    await editor.input("2");
    assertStringIncludes(editor.frame(), "SRAM Byte Order");
    for (let i = 0; i < 3; i++) await editor.input("\u001b[B");
    await editor.input("\r");
    await editor.input("\u001b[B");
    await editor.input("\u001b[B");
    await editor.input("\r");
    assertStringIncludes(editor.frame(), "Word-swapped (32-bit)");
    await editor.input("\u001b[B");
    await editor.input("\u001b[B");
    await editor.input("\u001b[B");
    await editor.input("\r");
    assertStringIncludes(editor.frame(), "Saved new-save.sra");
    assertEquals(FileUtil.loadFileFromBuffer(written).isByteSwapped, true);
  } finally {
    await editor.cleanup();
    open.restore();
  }
});

for (const format of [FileFormat.SRA, FileFormat.SRM]) {
  Deno.test(`TUI export-format changes control the output extension for ${FileFormat[format]} input`, async () => {
    const bytes = FileUtil.getFileData(new SraSaveFile(), format);
    let written = new Uint8Array();
    let outputPath = "";
    const open = stub(Deno, "openSync", (path, options) => {
      if (options?.write) outputPath = String(path);
      return {
        statSync: () => ({ size: bytes.length }),
        seekSync() {},
        readSync(buffer: Uint8Array) {
          buffer.set(bytes);
          return bytes.length;
        },
        writeSync(buffer: Uint8Array) {
          written = buffer.slice();
          return buffer.length;
        },
        close() {},
      } as unknown as Deno.FsFile;
    });
    const filename = format === FileFormat.SRA ? "game.sra" : "game.srm";
    const target = format === FileFormat.SRA ? FileFormat.SRM : FileFormat.SRA;
    const targetFilename = format === FileFormat.SRA ? "game.srm" : "game.sra";
    const editor = await renderEditor(40, false, filename);
    try {
      await editor.input("2");
      for (let i = 0; i < 4; i++) await editor.input("\u001b[B");
      await editor.input("\r");
      await editor.input(format === FileFormat.SRA ? "\u001b[B" : "\u001b[A");
      await editor.input("\r");
      assertStringIncludes(editor.frame(), targetFilename);
      await editor.input("\u001b[B");
      await editor.input("\u001b[B");
      await editor.input("\r");
      assertStringIncludes(editor.frame(), `Saved ${targetFilename}`);
      assertEquals(outputPath, targetFilename);
      assertEquals(FileUtil.detectFileFormatByBufferSize(written), target);
    } finally {
      await editor.cleanup();
      open.restore();
    }
  });
}

Deno.test("TUI new files show empty slots and create another new-game slot explicitly", async () => {
  const editor = await renderEditor(40);
  try {
    await editor.input("5");
    assertStringIncludes(editor.frame(), "Empty slot");
    await editor.input("\u0007");
    assertStringIncludes(editor.frame(), "Create or reset a new-game slot");
    for (let i = 0; i < 6; i++) await editor.input("\u001b[B");
    await editor.input("\r");
    assertStringIncludes(editor.frame(), "Choose slot:");
    await editor.input("\u001b[B");
    await editor.input("\r");
    await editor.input("\u001b");
    await editor.input("5");
    assertStringIncludes(editor.frame(), "Player Name");
    await editor.input("6");
    assertStringIncludes(editor.frame(), "Empty slot");
    await editor.input("8");
    assertStringIncludes(editor.frame(), "Empty slot");
  } finally {
    await editor.cleanup();
  }
});

Deno.test("TUI tabs retain independent pages and respect both page boundaries", async () => {
  const editor = await renderEditor(40);
  try {
    await editor.input("4");
    assertStringIncludes(editor.frame(), "page 1 / 6");
    assertStringIncludes(editor.frame(), "Player Name");
    await editor.input("]");
    assertStringIncludes(editor.frame(), "page 2 / 6");
    assertStringIncludes(editor.frame(), "Rupees");
    await editor.input("1");
    assertStringIncludes(editor.frame(), "page 1 / 1");
    assertStringIncludes(editor.frame(), "Filename");
    await editor.input("4");
    assertStringIncludes(editor.frame(), "page 2 / 6");
    await editor.input("\u001b[C");
    assertStringIncludes(editor.frame(), "page 1 / 1");
    assertStringIncludes(editor.frame(), "Empty slot");
    await editor.input("\u001b[D");
    assertStringIncludes(editor.frame(), "page 2 / 6");
    await editor.input("9");
    assertStringIncludes(editor.frame(), "Empty slot");
    assertStringIncludes(editor.frame(), "page 1 / 1");
    await editor.input("7");
    assertStringIncludes(editor.frame(), "page 1 / 6");
    await editor.input("[");
    assertStringIncludes(editor.frame(), "page 1 / 6");
    for (let i = 0; i < 8; i++) await editor.input("]");
    assertStringIncludes(editor.frame(), "page 6 / 6");
    assertStringIncludes(editor.frame(), "Permanent Scene Flags");
    await editor.input("[");
    assertStringIncludes(editor.frame(), "page 5 / 6");
    await editor.input("\u0007");
    assertStringIncludes(editor.frame(), "Save management");
    await editor.input("\u001b");
    assertStringIncludes(editor.frame(), "Filename");
    assertStringIncludes(editor.frame(), "page 1 / 1");
  } finally {
    await editor.cleanup();
  }
});

Deno.test("TUI paginates short tabs on small terminals and clamps pages after resizing", async () => {
  const editor = await renderEditor(18);
  try {
    assertStringIncludes(editor.frame(), "page 1 / 3");
    assertStringIncludes(editor.frame(), "Filename");
    await editor.input("]");
    assertStringIncludes(editor.frame(), "page 2 / 3");
    assertStringIncludes(editor.frame(), "Header Valid");
    await editor.input("]");
    assertStringIncludes(editor.frame(), "page 3 / 3");
    assertStringIncludes(editor.frame(), "File Format");
    await editor.input("]");
    assertStringIncludes(editor.frame(), "page 3 / 3");
    await editor.resize(40);
    assertStringIncludes(editor.frame(), "page 1 / 1");
    assertStringIncludes(editor.frame(), "Filename");
    await editor.input("2");
    await editor.resize(18);
    assertStringIncludes(editor.frame(), "page 1 / 2");
    await editor.input("]");
    assertStringIncludes(editor.frame(), "page 2 / 2");
    assertStringIncludes(editor.frame(), "File Format");
  } finally {
    await editor.cleanup();
  }
});

Deno.test("TUI page and tab shortcuts stay inactive while editing a field", async () => {
  const editor = await renderEditor(40);
  try {
    await editor.input("2");
    await editor.input("\u001b[B");
    await editor.input("\u001b[B");
    await editor.input("\r");
    assertStringIncludes(editor.frame(), "Editing Output Filename");
    await editor.input("]");
    await editor.input("4");
    assertStringIncludes(editor.frame(), "page 1 / 1");
    await editor.input("\u001b");
    await editor.input("\u001b[C");
    assertStringIncludes(editor.frame(), "Language");
    assertStringIncludes(editor.frame(), "page 1 / 1");
    await editor.input("4");
    assertStringIncludes(editor.frame(), "Player Name");
    assertStringIncludes(editor.frame(), "page 1 / 6");
  } finally {
    await editor.cleanup();
  }
});

for (const format of ["sra", "srm"]) {
  Deno.test(`TUI can override detected ${format} input without crashing on uninterpretable fields`, async () => {
    const save = new SraSaveFile();
    const source = format === "sra"
      ? save.getData()
      : SrmSaveFile.fromSaveFile(save).getData();
    const open = stub(Deno, "openSync", () =>
      ({
        statSync: () => ({ size: source.length }),
        seekSync() {},
        readSync(buffer: Uint8Array) {
          buffer.set(source);
          return source.length;
        },
        close() {},
      }) as unknown as Deno.FsFile);
    const editor = await renderEditor(40, false, `detected.${format}`);
    try {
      await editor.input("\u000f");
      await editor.input(format === "sra" ? "w" : "b");
      assertStringIncludes(editor.frame(), "overridden");
      await editor.input("4");
      assertStringIncludes(editor.frame(), "Field interpretations");
      assertStringIncludes(editor.frame(), "Player Name");
      await editor.input("\u000f");
      await editor.input(format === "sra" ? "b" : "w");
      await editor.input("4");
      assertStringIncludes(editor.frame(), "Player Name");
    } finally {
      await editor.cleanup();
      open.restore();
    }
  });
}

Deno.test("TUI exposes unaffected controls and an explicit replacement review for an unavailable field", async () => {
  const save = new SraSaveFile();
  save.slots[0].data[0x3A] = 2;
  save.slots[0].faroresWindWarp = { x: 123, y: -456, z: 789, yRotation: -90 };
  const source = save.getData();
  const loaded = FileUtil.loadFileFromBuffer(source, undefined, "partial.sra");
  const load = stub(FileUtil, "loadFile", () => loaded);
  const editor = await renderEditor(60, false, "partial.sra");
  try {
    await editor.input("4");
    assertStringIncludes(editor.frame(), "Field interpretations");
    assertStringIncludes(editor.frame(), "Player Name");
    await editor.input("\u001b[B");
    await editor.input("\u001b[B");
    await editor.input("\r");
    assertStringIncludes(editor.frame(), "magicFlag1");
    await editor.input("\r");
    await editor.input("false");
    await editor.input("\r");
    assertStringIncludes(editor.frame(), "Replace magicFlag1 with false");
    await editor.input("\u001b");
    assertStringIncludes(editor.frame(), "Field interpretations");
    assertEquals(loaded.slots[0].data[0x3A], 2);
    assertEquals(source, loaded.getData());
    await editor.input("\u001b[B");
    await editor.input("\r");
    await editor.input("\r");
    await editor.input("false");
    await editor.input("\r");
    assertStringIncludes(editor.frame(), "Replace magicFlag1 with false");
    await editor.input("\r");
    assertEquals(loaded.slots[0].magicFlag1, false);
    assertEquals(loaded.slots[0].checksum, save.slots[0].checksum);
    let pages = editor.frame();
    for (let page = 0; page < 4; page++) {
      await editor.input("]");
      pages += editor.frame();
    }
    assertStringIncludes(pages, "Farore's Wind");
    assertStringIncludes(pages, "tentative");
  } finally {
    await editor.cleanup();
    load.restore();
  }
});

for (const format of [FileFormat.SRA, FileFormat.SRM]) {
  for (
    const order of [ExportByteOrder.BigEndian, ExportByteOrder.WordSwapped]
  ) {
    Deno.test(`TUI correction review is keyboard accessible and preserves ${FileFormat[format]} ${order} export checksums`, async () => {
      const save = new SraSaveFile();
      save.slots[0].data[0x1C] = 0;
      save.slots[0].checksum = 0x1234;
      const original = FileUtil.getFileData(
        save,
        format,
        order,
        ChecksumPolicy.Preserve,
      );
      original[original.length - 1] = 0xCD;
      if (format === FileFormat.SRM) original[0] = 0xAB;
      const filename = `review.${FileFormat[format].toLowerCase()}`;
      const loaded = FileUtil.loadFileFromBuffer(original, undefined, filename);
      const load = stub(FileUtil, "loadFile", () => loaded);
      let written = new Uint8Array();
      const open = stub(Deno, "openSync", () =>
        ({
          writeSync(data: Uint8Array) {
            written = data.slice();
            return data.length;
          },
          close() {},
        }) as Deno.FsFile);
      const editor = await renderEditor(60, false, filename);
      try {
        await editor.input("\u0007");
        await editor.input("\r");
        assertStringIncludes(editor.frame(), "Review suggested corrections");
        assertEquals(
          FileUtil.getFileData(loaded, format, order, ChecksumPolicy.Preserve),
          original,
        );
        await editor.input("\u001b");
        assertEquals(
          FileUtil.getFileData(loaded, format, order, ChecksumPolicy.Preserve),
          original,
        );
        await editor.input("\r");
        await editor.input("d");
        await editor.input("a");
        await editor.input("\u001b");
        await editor.input("2");
        for (let i = 0; i < 6; i++) await editor.input("\u001b[B");
        await editor.input("\r");
        assertStringIncludes(editor.frame(), `Saved ${filename}`);
        assertEquals(written, original);
        await editor.input("\u0007");
        await editor.input("\r");
        await editor.input("\u001b[B");
        await editor.input(" ");
        assertStringIncludes(editor.frame(), "Checksum corrections omitted");
        assertEquals(
          FileUtil.getFileData(loaded, format, order, ChecksumPolicy.Preserve),
          original,
        );
        await editor.input("a");
        assertEquals(loaded.slots[0].data[0x1C], 0x5A);
        assertEquals(loaded.slots[0].checksum, 0x1234);
        const expected = original.slice();
        expected[
          (format === FileFormat.SRM ? 0x20800 : 0) +
          (order === ExportByteOrder.WordSwapped ? 0x3F : 0x3C)
        ] = 0x5A;
        assertEquals(
          FileUtil.getFileData(loaded, format, order, ChecksumPolicy.Preserve),
          expected,
        );
        await editor.input("\u001b");
        await editor.input("2");
        assertStringIncludes(editor.frame(), "Preserve stored checksums");
        for (let i = 0; i < 6; i++) await editor.input("\u001b[B");
        await editor.input("\r");
        assertStringIncludes(editor.frame(), `Saved ${filename}`);
        assertEquals(written, expected);
      } finally {
        await editor.cleanup();
        load.restore();
        open.restore();
      }
    });
  }
}

Deno.test("TUI review requires an explicit outcome change and refreshed confirmation for stale data", async () => {
  const save = new SraSaveFile();
  save.header.data[12] = 0xFF;
  save.slots[0].data[0x3A] = 2;
  const loaded = FileUtil.loadFileFromBuffer(save.getData());
  const load = stub(FileUtil, "loadFile", () => loaded);
  const editor = await renderEditor(60, false, "review.sra");
  try {
    await editor.input("\u0007");
    await editor.input("\u001b[B");
    await editor.input("\r");
    assertStringIncludes(editor.frame(), "Alternative:");
    await editor.input("k");
    assertStringIncludes(
      editor.frame(),
      "Desired outcome: keep stored header: padding",
    );
    await editor.input(" ");
    assertStringIncludes(editor.frame(), "requested value");
    await editor.input("a");
    assertEquals(loaded.header.isPaddingValid, false);
    await editor.input("o");
    loaded.header.languageOption = 1;
    const edited = loaded.getData();
    await editor.input("a");
    assertStringIncludes(editor.frame(), "stale");
    assertEquals(loaded.getData(), edited);
    await editor.input("r");
    assertEquals(loaded.getData(), edited);
    await editor.input("a");
    assertEquals(loaded.header.isPaddingValid, true);
    assertEquals(loaded.slots[0].data[0x3A], 2);
    await editor.input("\r");
    assertStringIncludes(editor.frame(), "Review suggested corrections");
    assertEquals(editor.frame().includes("Inspecting header: padding"), false);
    await editor.input("]");
    assertStringIncludes(editor.frame(), "uncertainty");
  } finally {
    await editor.cleanup();
    load.restore();
  }
});

Deno.test("TUI review accepts recommendations and displays unresolved findings without inventing fixes", async () => {
  const save = new SraSaveFile();
  save.slots[0].checksum = 0x1234;
  const loaded = FileUtil.loadFileFromBuffer(save.getData());
  const load = stub(FileUtil, "loadFile", () => loaded);
  const editor = await renderEditor(24, false, "review.sra");
  try {
    await editor.input("\u0007");
    await editor.input("\r");
    assertEquals(loaded.slots[0].checksum, 0x1234);
    await editor.input("a");
    assertEquals(loaded.slots[0].isChecksumValid(), true);
    await editor.input("\r");
    let pages = editor.frame();
    for (let page = 0; page < 6; page++) {
      await editor.input("]");
      pages += editor.frame();
    }
    assertStringIncludes(pages, "No supported corrections in this scope.");
    assertStringIncludes(pages, "uncertainty findings:");
    assertStringIncludes(pages, "Accepted correction history:");
  } finally {
    await editor.cleanup();
    load.restore();
  }
});
