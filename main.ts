import { LanguageOption, SoundOption } from "./models/saveheader.ts";
import { Age } from "./models/saveslot.ts";
import { Scene, Time } from "./models/scene.ts";
import { FileUtil } from "./utils/fileutil.ts";

function runTheThing() {
  if (Deno.args.length < 1) {
    console.error(`You need to provide a filename to open.`);
    return;
  }
  const filename = Deno.args[0];

  console.log(`>>> OoT Save Edit <<<`);

  const save = FileUtil.loadFile(filename);

  console.debug(`Successfully read the file: ${filename}`);
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

  FileUtil.saveFile(
    `${Deno.args[0]}_out`,
    FileUtil.detectFileFormatByExtension(filename),
    save,
  );
}

if (import.meta.main) {
  runTheThing();
}
