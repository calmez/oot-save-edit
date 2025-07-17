import { SraSaveFile } from "./models/srasavefile.ts";
import { LanguageOption, SoundOption } from "./models/saveheader.ts";
import { Age } from "./models/saveslot.ts";
import { Scene, Time } from "./models/scene.ts";

async function runTheThing() {
  if (Deno.args.length < 1) {
    console.error(`You need to provide a filename to open.`);
    return;
  }

  console.log(`>>> OoT Save Edit <<<`);

  const file = await Deno.open(Deno.args[0]);
  const save = new SraSaveFile(file);
  file.close();

  console.debug(`Successfully read the file: ${Deno.args[0]}`);
  console.debug(
    `Save has sound option ${SoundOption[save.header.soundOption]}`,
  );
  console.debug(
    `Save has language option ${LanguageOption[save.header.languageOption]}`,
  );
  const slot = save.slots[0];
  console.debug(`Link has age ${Age[slot.age]}`);
  console.debug(`Link has ${slot.rupees} rupees`);
  console.debug(`Link is actually called "${slot.playerName}"`);
  console.debug(
    `Link's health is ${slot.currentHealth / 16}/${slot.maxHealth / 16}`,
  );
  console.debug(`Link is in ${Scene[slot.savedSceneIndex]} scene`);
  console.debug(`The current time is ${Time[slot.nightFlag]}`);
  console.debug(`The current cutscene number is ${slot.cutSceneNumber}`);

  const outFile = await Deno.open(`${Deno.args[0]}_out`, {
    write: true,
    create: true,
  });
  save.write(outFile, true);
  outFile.close();
}

if (import.meta.main) {
  runTheThing();
}
