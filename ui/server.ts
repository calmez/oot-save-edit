import { join } from "@std/path";
import { Application } from "jsr:@oak/oak/application";
import { Router } from "jsr:@oak/oak/router";
import { Scene, Time } from "../models/scene.ts";
import { LanguageOption, SoundOption } from "../models/saveheader.ts";
import { FileUtil } from "../utils/fileutil.ts";

function buildOutput(filename?: string): string {
  if (!filename) {
    throw new Error("No filename provided");
  }
  const basePath = join(Deno.cwd(), "test-data"); // TODO: let user set this in UI
  const save = FileUtil.loadFile(`${basePath}/${filename}`);

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

export default function runServer(controller?: AbortController) {
  const router = new Router();
  router.get("/", (ctx) => {
    ctx.response.body = `
      <html>
        <body>
          <h1>Open a file</h1>
          <input id="file" type="file" accept=".srm" />
          <button onclick="exit()">Exit</button>
          <script>
            // hack because we get a weird path from the file input
            // e.g. C:\fakepath\oot.srm
            // TODO let user set the path from the UI
            const fileInput = document.getElementById("file");
            fileInput.addEventListener("change", () => {
              window.location = "/file/" + fileInput.value.split("\\\\")[2];
            });
          </script>
        </body>
      </html>
    `;
  });
  router.get("/file/:filename", (ctx) => {
    ctx.response.body = buildOutput(ctx.params.filename);
  });

  const app = new Application();
  app.use(router.routes());
  app.use(router.allowedMethods());

  app.listen({
    port: 8000,
    signal: controller?.signal,
  });
}

if (import.meta.main) {
  runServer();
}
