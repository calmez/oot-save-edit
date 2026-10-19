import { assertEquals, assertStringIncludes } from "@std/assert";
import { stub } from "@std/testing/mock";
import { render } from "ink";
import { PassThrough } from "node:stream";
import { setImmediate } from "node:timers/promises";
import type { ReadStream, WriteStream } from "node:tty";
import { stripVTControlCharacters } from "node:util";
import { act, createElement } from "react";

import { SraSaveFile, SrmSaveFile } from "../../models/savefile.ts";
import { FileUtil } from "../../utils/fileutil.ts";
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
    const editor = await renderEditor(40, false, `ambiguous.${format}`);
    try {
      assertStringIncludes(editor.frame(), "Choose input byte order");
      assertStringIncludes(editor.frame(), "checksums passing");
      assertEquals(editor.frame().includes("Filename"), false);
      for (const [key, order] of [["w", "word-swapped"], ["b", "big-endian"]]) {
        await editor.input(key);
        assertStringIncludes(editor.frame(), "Filename");
        assertStringIncludes(editor.frame(), `overridden (${order})`);
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
    await editor.input("\r");
    assertStringIncludes(editor.frame(), "Saved new-save.sra");
    assertEquals(FileUtil.loadFileFromBuffer(written).isByteSwapped, true);
  } finally {
    await editor.cleanup();
    open.restore();
  }
});

Deno.test("TUI new files show empty slots and create another new-game slot explicitly", async () => {
  const editor = await renderEditor(40);
  try {
    await editor.input("5");
    assertStringIncludes(editor.frame(), "Empty slot");
    await editor.input("\u0007");
    assertStringIncludes(editor.frame(), "Create or reset a new-game slot");
    for (let i = 0; i < 5; i++) await editor.input("\u001b[B");
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
      assertStringIncludes(editor.frame(), "Cannot display this record");
      assertStringIncludes(editor.frame(), "ddOnly");
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
