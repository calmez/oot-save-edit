import { SaveFile } from "./models/savefile.ts";
import { SoundOption } from "./models/saveheader.ts";
import { Age } from "./models/saveslot.ts";

if (import.meta.main) {
  console.log(`>>> OoT Save Edit <<<`);

  const file = await Deno.open("./test-data/new-game.srm");
  const save = new SaveFile(file);

  console.debug(`Successfully read the file`);
  console.debug(
    `Save has sound option '${SoundOption[save.header.soundOption]}'`,
  );
  console.debug(`Link has age '${Age[save.slots[0].age]}'`);
  console.debug(`Link has ${save.slots[0].rupees} rupees`);
}
