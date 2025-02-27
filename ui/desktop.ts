import { Webview } from "@webview/webview";
import { SaveFile } from "../models/savefile.ts";
import { Scene, Time } from "../models/scene.ts";
import { LanguageOption, SoundOption } from "../models/saveheader.ts";

const webview = new Webview();
webview.title = "oot-save-edit";

async function buildOutput(filename: string): Promise<string> {
  const file = await Deno.open(filename);
  const save = new SaveFile(file);
  file.close();

  return `
    <html>
    <body>
      <h1>File: ${filename}</h1>
      <p>Sound option: ${SoundOption[save.header.soundOption]}</p>
      <p>Language option: ${LanguageOption[save.header.languageOption]}</p>
      <p>Link has age: ${save.slots[0].age}</p>
      <p>Link has ${save.slots[0].rupees} rupees</p>
      <p>Link is actually called "${save.slots[0].playerName}"</p>
      <p>Link's health is ${save.slots[0].currentHealth / 16}/${save.slots[0].maxHealth / 16}</p>
      <p>Link is in ${Scene[save.slots[0].savedSceneIndex]} scene</p>
      <p>The current time is ${Time[save.slots[0].nightFlag]}</p>
      <p>The current cutscene number is ${save.slots[0].cutSceneNumber}</p>
    </body>
    </html>
  `;
}

webview.navigate(`data:text/html,${encodeURIComponent(await buildOutput('./test-data/new-game.srm'))}`);
webview.run();
