import { assertEquals, assertExists } from "@std/assert";
import { parseHTML } from "npm:linkedom@0.18.12";
import { h, render } from "preact";
import { act } from "preact/test-utils";

import { ChecksumPolicy, SraSaveFile } from "../../../models/savefile.ts";
import SkulltulaEditor from "./skulltulas.tsx";

Deno.test("web Skulltula intents review uncertainty, decline, cancellation, stale confirmation and preserved locations", async () => {
  const window = parseHTML("<html><body></body></html>");
  const document = window.document as unknown as Document;
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: document,
  });
  const save = new SraSaveFile();
  save.slots[0].data[0xEAB] = 0x80;
  const before = save.getData();
  let changed = 0;
  let policy: ChecksumPolicy | undefined;
  const container = document.body;
  async function click(label: string) {
    const button = [...container.querySelectorAll("button")].find((item) =>
      item.textContent === label
    );
    assertExists(button, label);
    await act(() => button.click());
  }
  async function location() {
    const control = container.querySelector<HTMLInputElement>(
      'input[aria-label="Kokiri Forest: bean patch"]',
    );
    assertExists(control);
    control.checked = true;
    await act(() => {
      control.dispatchEvent(new window.Event("change", { bubbles: true }));
    });
  }
  try {
    await act(() =>
      render(
        h(SkulltulaEditor, {
          save,
          onChange: (value) => {
            changed++;
            policy = value;
          },
        }),
        container,
      )
    );
    await location();
    assertEquals(container.textContent?.includes("3 of 100"), true);
    const indicator = container.querySelector<HTMLInputElement>(
      'input[aria-label="Apply Slot 1: skulltula.indicator"]',
    );
    assertExists(indicator);
    assertEquals(indicator.checked ?? indicator.hasAttribute("checked"), true);
    assertEquals(save.getData(), before);
    await click("Cancel review");
    assertEquals(save.getData(), before);
    await location();
    await click("Keep stored Slot 1: skulltula.indicator");
    const conflicting = container.querySelector<HTMLInputElement>(
      'input[aria-label="Apply Slot 1: skulltula.indicator"]',
    );
    assertExists(conflicting);
    await act(() => {
      conflicting.dispatchEvent(new window.Event("change", { bubbles: true }));
    });
    assertEquals(container.textContent?.includes("requested value"), true);
    assertEquals(save.getData(), before);
    await click("Allow correction instead for Slot 1: skulltula.indicator");
    await click("Decline all corrections");
    await click("Confirm selected corrections");
    assertEquals(save.slots[0].data[0xEAB], 0x81);
    assertEquals(save.slots[0].data[0xA5] & 0x80, 0);
    assertEquals(policy, ChecksumPolicy.Preserve);
    const total = container.querySelector<HTMLInputElement>(
      'input[aria-label="Requested Skulltula total"]',
    );
    assertExists(total);
    total.value = "0";
    await act(() => {
      total.dispatchEvent(new window.Event("input", { bubbles: true }));
    });
    await click("Review requested total");
    assertEquals(container.textContent?.includes("below 1 known"), true);
    save.slots[0].rupees = 17;
    await click("Confirm selected corrections");
    assertEquals(changed, 1);
    assertEquals(container.textContent?.includes("stale"), true);
    await click("Refresh review");
    await click("Confirm selected corrections");
    assertEquals(changed, 2);
    const nextLocation = container.querySelector<HTMLInputElement>(
      'input[aria-label="Kokiri Forest: Know-It-All House"]',
    );
    assertExists(nextLocation);
    nextLocation.checked = true;
    await act(() => {
      nextLocation.dispatchEvent(new window.Event("change", { bubbles: true }));
    });
    await click("Confirm selected corrections");
    assertEquals(save.slots[0].data[0xA5] & 0x80, 0x80);
    assertEquals(save.slots[0].isChecksumValid(), true);
    assertEquals(save.slots[0].goldSkulltulaTokens, 0);
    assertEquals(save.slots[0].data[0xEAB], 0x83);
  } finally {
    await act(() => render(null, container));
    if (descriptor) Object.defineProperty(globalThis, "document", descriptor);
    else Reflect.deleteProperty(globalThis, "document");
  }
});
