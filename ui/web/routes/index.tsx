import { Head } from "fresh/runtime";
import { define } from "../utils.ts";

export default define.page(function Home(_ctx) {
  return (
    <>
      <Head>
        <title>OOT Save Edit</title>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon-180x180.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href="/apple-touch-icon-167x167.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/apple-touch-icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/apple-touch-icon-120x120.png"
        />
      </Head>
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <img
          class="my-6"
          src="/ocarina.png"
          width="128"
          height="128"
          alt="the OOT Save Edit logo: an ocarina from the game"
        />
        <h1 class="text-4xl font-bold">OOT Save Edit</h1>
        <p class="my-4">
          Web interface for editing Ocarina of Time save files
        </p>
        <p class="my-4">
          ⚠️ This project is still very much work in progress and not fully
          usable at this moment. ⚠️
        </p>
        <a class="rounded-full bg-blue-500 text-white py-2 px-4" href="/save">
          Upload a save file to get started
        </a>
      </div>
    </>
  );
});
