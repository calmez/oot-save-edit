import React from "react";
import { Box, render, Text, useFocus } from "ink";
import Gradient from "ink-gradient";
import { Save } from "./save.tsx";

const App = (): React.JSX.Element => {
  useFocus();
  const width = Deno.consoleSize().columns;
  const height = Deno.consoleSize().rows;
  const filename: string = Deno.args[0];

  return (
    <Box
      width={width}
      height={height}
      flexDirection="column"
      gap={1}
      padding={1}
      borderStyle="round"
      borderColor="white"
      overflow="scroll"
    >
      <Box flexDirection="row" justifyContent="center">
        <Gradient name="rainbow">
          <Text>"Welcome to OOT Save Edit!"</Text>
        </Gradient>
      </Box>
      <Save
        filename={filename && filename !== "--new" ? filename : "new-save.sra"}
        createNew={!filename || filename === "--new"}
      />
    </Box>
  );
};

const { rerender } = render(<App />);
let currentSize = Deno.consoleSize();
Deno.addSignalListener("SIGWINCH", () => {
  const newSize = Deno.consoleSize();
  if (
    newSize.columns !== currentSize.columns || newSize.rows !== currentSize.rows
  ) {
    currentSize = newSize;
    rerender(<App />);
  }
});
