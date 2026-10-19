import { assertEquals, assertStringIncludes } from "@std/assert";
import { render } from "ink";
import { PassThrough } from "node:stream";
import { setImmediate } from "node:timers/promises";
import type { ReadStream, WriteStream } from "node:tty";
import { stripVTControlCharacters } from "node:util";
import { act, createElement } from "react";

import { SraSaveFile } from "../../models/savefile.ts";

import SkulltulaEditor from "./skulltulas.tsx";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

Deno.test("TUI location and total intents allow cancellation, decline, stale refresh and deliberate confirmation", async () => {
  const save = new SraSaveFile();
  save.slots[0].data[0xEAB] = 0x80;
  const before = save.getData();
  let changed = 0;
  let frame = "";
  const stdout = Object.assign(new PassThrough(), { columns: 160, rows: 180 });
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
  stdout.on("data", (chunk) => {
    frame = stripVTControlCharacters(chunk.toString());
  });
  let instance: ReturnType<typeof render>;
  await act(async () => {
    instance = render(
      createElement(SkulltulaEditor, {
        save,
        target: 0,
        onChange() {
          changed++;
        },
        onClose() {},
      }),
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
  async function input(value: string) {
    await act(async () => {
      stdin.write(value);
      await setImmediate();
    });
  }
  try {
    assertStringIncludes(frame, "3 of 100");
    await input("\r"); // First named location.
    assertStringIncludes(frame, "skulltula.indicator");
    assertEquals(save.getData(), before);
    await input("\u001b");
    assertEquals(save.getData(), before);
    await input("\r");
    await input("\u001b[B"); // Inspect the indicator after checksum.
    await input("k"); // Retain its stored value.
    await input(" "); // Deliberately conflicting selection.
    await input("a");
    assertEquals(save.getData(), before);
    assertStringIncludes(frame, "requested value");
    await input("o");
    await input("d");
    await input("a");
    assertEquals(save.slots[0].data[0xEAB], 0x81);
    assertEquals(save.slots[0].data[0xA5] & 0x80, 0);
    assertEquals(changed, 1);
    await input("\u001b[B");
    await input("\u001b[B");
    await input("\u001b[B");
    await input("\r"); // Request total.
    await input("0");
    await input("\r");
    assertStringIncludes(frame, "below 1 known");
    save.slots[0].rupees = 23;
    await input("a");
    assertEquals(changed, 1);
    assertStringIncludes(frame, "stale");
    await input("r");
    await input("a");
    assertEquals(changed, 2);
    assertEquals(save.slots[0].goldSkulltulaTokens, 0);
    assertEquals(save.slots[0].data[0xEAB], 0x81);
    await input("\u001b[B"); // Second known location, confirm recommended indicator.
    await input("\r");
    await input("a");
    assertEquals(save.slots[0].data[0xEAB], 0x83);
    assertEquals(save.slots[0].data[0xA5] & 0x80, 0x80);
    assertEquals(save.slots[0].isChecksumValid(), true);
  } finally {
    await act(async () => {
      instance.unmount();
      instance.cleanup();
      await setImmediate();
    });
    stdout.destroy();
    stdin.destroy();
  }
});
