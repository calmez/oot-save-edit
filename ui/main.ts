import { Webview } from "@webview/webview";
import { SaveFile } from "../models/savefile.ts";
import { Scene, Time } from "../models/scene.ts";
import { LanguageOption, SoundOption } from "../models/saveheader.ts";

const webview = new Webview(true);
webview.title = "oot-save-edit";

webview.bind("exit", () => {
  webview.destroy();
  Deno.exit();
});

webview.bind("fileOpen", (filename: string) => {
  webview.navigate(
    `data:text/html,${
      encodeURIComponent(
        buildOutput(
          // hack because we get a weird path from the file input
          // e.g. C:\fakepath\oot.srm
          `THIS_NEEDS_A_FIXED_PATH_TO_A_FOLDER_AS_A_WORKAROND/${filename.split('\\')[2]}`
        )
      )
    }`,
  );
});

function buildOutput(filename: string): string {
  const file = Deno.openSync(filename);
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
      <p>Link's health is ${save.slots[0].currentHealth / 16}/${
    save.slots[0].maxHealth / 16
  }</p>
      <p>Link is in ${Scene[save.slots[0].savedSceneIndex]} scene</p>
      <p>The current time is ${Time[save.slots[0].nightFlag]}</p>
      <p>The current cutscene number is ${save.slots[0].cutSceneNumber}</p>
    </body>
    </html>
  `;
}

webview.navigate(
  `data:text/html,${
    encodeURIComponent(`
      <html>
        <body>
          <h1>Open a file</h1>
          <input id="file" type="file" accept=".srm" />
          <button onclick="exit()">Exit</button>
          <script>
            const fileInput = document.getElementById("file");
            fileInput.addEventListener("change", (event) => {
              fileOpen(fileInput.value);
            });
          </script>
        </body>
      </html>
    `)
  }`,
);

webview.run();
