import { Head } from "fresh/runtime";
import { Button } from "../components/Button.tsx";
import { define } from "../utils.ts";
import Save from "../islands/Save.tsx";

export const handler = define.handlers({
  async GET(ctx) {
    return { data: { message: null } };
  },
  async POST(ctx) {
    const form = await ctx.req.formData();
    const file = form.get("save") as File;

    if (!file) {
      return { data: { message: "Please try again" } };
    }

    const name = file.name;
    const contents = await file.bytes();

    ctx.state.filename = name;
    ctx.state.save = contents;

    console.log(`Uploaded file ${name} (${contents.byteLength} bytes)`);

    return ctx.render(<Save filename={name} save={contents} />);
  },
});

export default define.page<typeof handler>(function Upload(props) {
  const { message } = props.data;
  return (
    <div class="px-4 py-8 mx-auto fresh-gradient min-h-screen">
      <Head>
        <title>Upload</title>
      </Head>
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <form method="post" encType="multipart/form-data">
          <input type="file" accept=".sra,.srm" name="save" />
          <Button type="submit">Upload</Button>
        </form>
        {message ? <p>{message}</p> : null}
      </div>
    </div>
  );
});