import React from "react";
import { Box, render, Text, useFocus } from "ink";
import Gradient from "ink-gradient";
import { Save } from "./save.tsx";

const App = () => {
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
    >
      <Box flexDirection="row" justifyContent="center">
        <Gradient name="rainbow">
          <Text>"Welcome to OOT Save Edit!"</Text>
        </Gradient>
      </Box>
      {!!filename && filename.length > 0 ? <Save filename={filename} /> : (
        <Text>
          No file selected, please provide a filename as first argument.
        </Text>
      )}
    </Box>
  );
};

const { rerender } = render(<App />, { exitOnCtrlC: false});
let currentSize = Deno.consoleSize();
Deno.addSignalListener("SIGWINCH", () => {
  const newSize = Deno.consoleSize();
  if (newSize.columns !== currentSize.columns || newSize.rows !== currentSize.rows) {
    currentSize = newSize;
    rerender(<App />);
  }
});