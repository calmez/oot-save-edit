import { define } from "../utils.ts";

export default define.page(function App({ Component }) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>oot-save-edit</title>
      </head>
      <body>
        <div class="px-4 py-8 mx-auto fresh-gradient min-h-screen">
          <Component />
        </div>
      </body>
    </html>
  );
});
