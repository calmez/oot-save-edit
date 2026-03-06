import { Head } from "fresh/runtime";
import { Button } from "../components/Button.tsx";
import { define } from "../utils.ts";
import Save from "../components/Save.tsx";
import { SraSaveFile } from "../../../models/savefile.ts";

export const handler = define.handlers({
  GET(_ctx) {
    return { data: { message: null } };
  },
  async POST(ctx) {
    const form = await ctx.req.formData();
    const action = form.get("action") as string;
    const file = form.get("save") as File;

    if (action === "create") {
      const blankSave = new SraSaveFile().data;
      return ctx.render(<Save filename="new-save.sra" save={blankSave} />);
    }

    if (!file) {
      return { data: { message: "Please try again" } };
    }

    const name = file.name;
    const contents = await file.bytes();

    console.log(`Uploaded file ${name} (${contents.byteLength} bytes)`);

    return ctx.render(<Save filename={name} save={contents} />);
  },
});

export default define.page<typeof handler>(function Save(props) {
  const { message } = props.data;
  return (
    <>
      <Head>
        <title>Create or Load a Savefile</title>
      </Head>
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center mb-6">
        <form
          method="post"
          encType="multipart/form-data"
          className="w-full flex flex-col items-center gap-4 bg-white/80 rounded-lg shadow-md p-6"
        >
          <label className="w-full flex flex-col items-center cursor-pointer">
            <span className="mb-2 text-lg font-medium text-gray-700">
              Select Save File
            </span>
            <input type="hidden" name="action" value="load" />
            <input
              type="file"
              accept=".sra,.srm"
              name="save"
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                transition-colors duration-150"
            />
          </label>
          <Button type="submit">
            Upload
          </Button>
        </form>
      </div>
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center mb-6">
        <form
          method="post"
          encType="multipart/form-data"
          className="w-full flex flex-col items-center gap-4 bg-white/80 rounded-lg shadow-md p-6"
        >
          <span className="mb-2 text-lg font-medium text-gray-700">
            Don't have a save file?
          </span>
          <input type="hidden" name="action" value="create" />
          <Button type="submit">
            Create Blank Save
          </Button>
        </form>
      </div>
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center mb-6">
        {message && (
          <div className="w-full bg-red-100 text-red-700 p-4 rounded">
            {message}
          </div>
        )}
      </div>
    </>
  );
});
