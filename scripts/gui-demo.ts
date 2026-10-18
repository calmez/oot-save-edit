// Start deno task web:dev, then run deno task build:demo:gui.
import { assert, assertEquals } from "@std/assert";
import { fromFileUrl, join } from "@std/path";
import { Buffer } from "node:buffer";
import { chromium } from "npm:playwright@1.64.1";

import { FileUtil } from "../utils/fileutil.ts";

const viewport = { width: 1280, height: 800 };
const baseUrl = Deno.args[0] ?? "http://localhost:5173";
const fixturePath = fromFileUrl(
  new URL("../test-data/new-game.sra", import.meta.url),
);
const videoPath = fromFileUrl(new URL("../demos/gui.webm", import.meta.url));
const gifPath = fromFileUrl(new URL("../demos/gui.gif", import.meta.url));
const temporaryDirectory = await Deno.makeTempDir({
  prefix: "oot-save-edit-gui-demo-",
});
const fixture = FileUtil.loadFile(fixturePath);
const browser = await chromium.launch({ slowMo: 250 });

try {
  const context = await browser.newContext({
    viewport,
    recordVideo: { dir: temporaryDirectory, size: viewport },
  });
  const page = await context.newPage();
  const video = page.video();
  assert(video, "The GUI demo requires video recording.");

  // Pauses pace the recording; locator waits handle readiness.
  const pause = (milliseconds = 1000) => page.waitForTimeout(milliseconds);

  try {
    await page.goto(new URL("/save", baseUrl).href);
    await pause();
    await page.getByLabel("Select save file").setInputFiles({
      name: "demo.sra",
      mimeType: "application/octet-stream",
      buffer: Buffer.from(fixture.data),
    });
    await page.getByRole("button", { name: "Upload", exact: true }).click();
    await page.getByRole("heading", { name: "Save File Details" }).waitFor();
    await page.waitForLoadState("networkidle");
    await pause();

    // Each slot card contains a header row followed by its fields.
    const firstSlot = page.getByRole("heading", { name: "File 1", exact: true })
      .locator("..").locator("..");
    await firstSlot.scrollIntoViewIfNeeded();
    const playerName = firstSlot.getByRole("textbox");
    await playerName.press("ControlOrMeta+A");
    await playerName.pressSequentially("Link", { delay: 120 });
    await playerName.press("Tab");
    assertEquals(await playerName.inputValue(), "Link");
    await pause();

    await firstSlot.getByRole("button", { name: "Show details" }).click();
    await firstSlot.getByRole("heading", { name: "World State" }).waitFor();
    await firstSlot.getByRole("heading", { name: "Vitals & Currency" })
      .scrollIntoViewIfNeeded();
    await pause(1500);
    await firstSlot.getByRole("button", { name: "Hide details" }).click();
    await pause(500);

    const synchronize = page.getByRole("button", {
      name: "Synchronize backups",
    });
    await synchronize.scrollIntoViewIfNeeded();
    await pause(750);
    await synchronize.click();
    await page.getByRole("status").filter({ hasText: "Backups synchronized." })
      .waitFor();
    await pause();

    const save = page.getByRole("button", { name: "Save", exact: true });
    await save.scrollIntoViewIfNeeded();
    await pause(500);
    const downloadPromise = page.waitForEvent("download");
    await save.click();
    const download = await downloadPromise;
    assertEquals(download.suggestedFilename(), "demo.sra");
    const savePath = join(temporaryDirectory, "demo.sra");
    await download.saveAs(savePath);
    const saved = FileUtil.loadFile(savePath);
    assertEquals(saved.slots[0].playerName, "Link");
    for (const [index, backup] of saved.backups.entries()) {
      assertEquals(backup.playerName, saved.slots[index].playerName);
      assertEquals(backup.fileIndex, index);
      assert(
        backup.isChecksumValid(),
        `Backup ${index + 1} checksum is invalid.`,
      );
    }
    await pause(1500);

    await page.getByText("Backup Slots", { exact: true }).click();
    const firstBackup = page.getByRole("heading", {
      name: "Backup 1",
      exact: true,
    })
      .locator("..").locator("..");
    await firstBackup.scrollIntoViewIfNeeded();
    assertEquals(await firstBackup.getByRole("textbox").inputValue(), "Link");
    await pause(2000);
    console.log(`Edited save: ${savePath}`);
  } finally {
    await context.close();
  }

  await video.saveAs(videoPath);
  console.log(`GUI recording: ${videoPath}`);
} finally {
  await browser.close();
}

const conversion = await new Deno.Command("ffmpeg", {
  args: [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-i",
    videoPath,
    "-filter_complex",
    "fps=12,scale=960:-1:flags=lanczos,split[frames][colors];[colors]palettegen[palette];[frames][palette]paletteuse=dither=bayer:bayer_scale=3",
    "-loop",
    "0",
    gifPath,
  ],
}).output();
if (!conversion.success) {
  throw new Error(
    `Could not create GUI GIF: ${
      new TextDecoder().decode(conversion.stderr).trim()
    }`,
  );
}
console.log(`GUI GIF: ${gifPath}`);
