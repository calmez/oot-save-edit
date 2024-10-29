import { Age, SaveFile, SoundOption } from "./savefile.ts";

if (import.meta.main) {
  console.log(`>>> OoT Save Edit <<<`);

  new SaveFile().read('./test-data/new-game.srm').then(save => {
    console.debug(`Successfully read the file`);
    console.debug(`Save has sound option '${SoundOption[save.header.soundOption]}'`);
    console.debug(`Link has age '${Age[save.slots[0].age]}'`);
    console.debug(`Link has ${save.slots[0].rupees} rupees`);
  });
}
