import { assertEquals, assertStringIncludes } from "@std/assert";
import { render } from "ink";
import { PassThrough } from "node:stream";
import { setImmediate } from "node:timers/promises";
import type { ReadStream, WriteStream } from "node:tty";
import { stripVTControlCharacters } from "node:util";
import { act, createElement } from "react";

import { SraSaveFile } from "../../models/savefile.ts";
import { CorrectionReview } from "../correctionreview.ts";
import ReviewCorrections from "./correctionreview.tsx";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

Deno.test("TUI recovery review compares progress, toggles replacement and checksum independently, then confirms", async () => {
  const save = new SraSaveFile();
  save.slots[0].maxHealth = 160;
  save.slots[0].updateChecksum();
  save.backups[0].maxHealth = 48;
  save.backups[0].updateChecksum();
  const backup = save.backups[0].data.slice();
  const before = save.getData();
  const review = new CorrectionReview(save);
  review.open();
  const restoration = review.plan.recovery.find((item) =>
    item.action === "restore"
  )!;
  let confirmed = false;
  let frame = "";
  const stdout = Object.assign(new PassThrough(), { columns: 140, rows: 120 });
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
      createElement(ReviewCorrections, {
        review,
        onConfirm: () => confirmed = true,
        onCancel() {},
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
    assertStringIncludes(frame, "10 hearts");
    assertStringIncludes(frame, "3 hearts");
    assertStringIncludes(frame, "passing checks do not establish freshness");
    assertEquals(save.getData(), before);
    await input("\u001b[B");
    assertStringIncludes(frame, "Inspecting restore backup 1 to primary 1");
    await input(" ");
    assertStringIncludes(frame, "Preview: replace primary 1 with backup 1");
    assertEquals(save.getData(), before);
    await input("c");
    assertEquals(review.replacementChecksums[restoration.id], false);
    await input("a");
    assertEquals(confirmed, true);
    assertEquals(save.slots[0].maxHealth, 48);
    assertEquals(save.backups[0].data, backup);
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
