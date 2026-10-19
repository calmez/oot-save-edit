import { assertEquals, assertExists } from "@std/assert";
import { parseHTML } from "npm:linkedom@0.18.12";
import { h, render } from "preact";
import { act } from "preact/test-utils";

import { SraSaveFile } from "../../../models/savefile.ts";
import { SaveSlot } from "../../../models/saveslot.ts";
import { CorrectionReview } from "../../correctionreview.ts";
import SaveManagement from "./SaveManagement.tsx";

Deno.test("web manual copy warns before replacing occupied progress with an empty record", async () => {
  const window = parseHTML("<html><body></body></html>");
  const document = window.document as unknown as Document;
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: document,
  });
  const container = document.body;
  const save = new SraSaveFile();
  const review = new CorrectionReview(save);
  let changed = 0;
  async function select(label: string, value: string) {
    const control = container.querySelector<HTMLSelectElement>(
      `select[aria-label="${label}"]`,
    );
    assertExists(control);
    const option = Array.from(control.querySelectorAll("option")).find((item) =>
      item.value === value
    );
    assertExists(option);
    option.selected = true;
    await act(() => {
      control.dispatchEvent(new window.Event("change", { bubbles: true }));
    });
  }
  async function click(label: string) {
    const button = Array.from(container.querySelectorAll("button")).find((
      item,
    ) => item.textContent === label);
    assertExists(button, label);
    await act(() => button.click());
  }
  try {
    await act(() =>
      render(
        h(SaveManagement, {
          save,
          review,
          onChange: () => changed++,
          onChecksumPolicy() {},
        }),
        container,
      )
    );
    await select("Copy from", "1");
    await select("Destination slot", "0");
    await click("Copy / restore slot");
    assertEquals(
      container.textContent?.includes("will replace initialized progress"),
      true,
    );
    assertEquals(save.slots[0].isEmpty, false);
    assertEquals(changed, 0);
    await click("Confirm empty record copy");
    assertEquals(save.slots[0].isEmpty, true);
    assertEquals(changed, 1);
  } finally {
    await act(() => render(null, container));
    if (descriptor) Object.defineProperty(globalThis, "document", descriptor);
    else Reflect.deleteProperty(globalThis, "document");
  }
});

Deno.test("web bulk synchronization previews every selected backup and waits for confirmation", async () => {
  const window = parseHTML("<html><body></body></html>");
  const document = window.document as unknown as Document;
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: document,
  });
  const container = document.body;
  const save = new SraSaveFile();
  save.slots[0].rupees = 321;
  save.slots[0].updateChecksum();
  save.slots[1] = SaveSlot.createNewGame(1);
  save.slots[1].rupees = 44;
  save.slots[1].updateChecksum();
  const primaryRecords = save.slots.map((slot) => slot.data.slice());
  const before = save.getData();
  const review = new CorrectionReview(save);
  let changed = 0;
  async function click(label: string) {
    const button = Array.from(container.querySelectorAll("button")).find((
      item,
    ) => item.textContent === label);
    assertExists(button, label);
    await act(() => button.click());
  }
  try {
    await act(() =>
      render(
        h(SaveManagement, {
          save,
          review,
          onChange: () => changed++,
          onChecksumPolicy() {},
        }),
        container,
      )
    );
    await click("Review and synchronize backups");
    assertEquals(review.selected.length, 2);
    assertEquals(
      review.plan.recovery.filter((item) => review.selected.includes(item.id))
        .map((item) => item.index),
      [0, 1],
    );
    assertEquals(
      container.textContent?.includes("Replace backup 1 with primary 1"),
      true,
    );
    assertEquals(
      container.textContent?.includes("Replace backup 2 with primary 2"),
      true,
    );
    assertEquals(save.getData(), before);
    assertEquals(changed, 0);

    await click("Confirm selected corrections");

    assertEquals(save.backups[0].rupees, 321);
    assertEquals(save.backups[1].rupees, 44);
    assertEquals(save.backups[1].fileIndex, 1);
    assertEquals(save.slots.map((slot) => slot.data), primaryRecords);
    assertEquals(changed, 1);
  } finally {
    await act(() => render(null, container));
    if (descriptor) Object.defineProperty(globalThis, "document", descriptor);
    else Reflect.deleteProperty(globalThis, "document");
  }
});
