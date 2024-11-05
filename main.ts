import { SaveFile } from "./models/savefile.ts";
import { SoundOption } from "./models/saveheader.ts";
import { Age } from "./models/saveslot.ts";

async function runTheThing() {
  if (Deno.args.length < 1) {
    console.error(`You need to provide a filename to open.`);
    return;
  }

  console.log(`>>> OoT Save Edit <<<`);

  const file = await Deno.open(Deno.args[0]);
  const save = new SaveFile(file);

  console.debug(`Successfully read the file`);
  console.debug(
    `Save has sound option '${SoundOption[save.header.soundOption]}'`,
  );
  const slot = save.slots[0];
  console.debug(`Link has age '${Age[slot.age]}'`);
  console.debug(`Link has ${slot.rupees} rupees`);
  console.debug(`Link is actually called ${slot.playerName}`);
  console.debug(`Link's health is ${slot.currentHealth / 16} / ${slot.maxHealth / 16}`);
}

if (import.meta.main) {
  runTheThing();
}
