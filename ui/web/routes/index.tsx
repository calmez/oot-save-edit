import { useSignal } from "@preact/signals";
import { Head } from "fresh/runtime";
import { define } from "../utils.ts";
import Counter from "../islands/Counter.tsx";

export default define.page(function Home(ctx) {
  const count = useSignal(3);

  console.log("Shared value " + ctx.state.shared);

  return (
    <div class="px-4 py-8 mx-auto fresh-gradient min-h-screen">
      <Head>
        <title>OOT Save Edit</title>
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
        <Counter count={count} />
      </div>
    </div>
  );
});
