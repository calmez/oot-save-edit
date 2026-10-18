import { assertEquals, assertStringIncludes } from "@std/assert";
import { render } from "ink";
import { PassThrough } from "node:stream";
import { setImmediate } from "node:timers/promises";
import type { ReadStream, WriteStream } from "node:tty";
import { stripVTControlCharacters } from "node:util";
import { act, createElement } from "react";

import { Save } from "./save.tsx";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

interface TestEditor {
  frame: () => string;
  input: (input: string) => Promise<void>;
  resize: (rows: number) => Promise<void>;
  cleanup: () => Promise<void>;
}

async function renderEditor(rows: number): Promise<TestEditor> {
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
      createElement(Save, { filename: "new-save.sra", createNew: true }),
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
    assertStringIncludes(editor.frame(), "page 1 / 6");
    assertStringIncludes(editor.frame(), "Player Name");
    await editor.input("\u001b[D");
    assertStringIncludes(editor.frame(), "page 2 / 6");
    await editor.input("9");
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
