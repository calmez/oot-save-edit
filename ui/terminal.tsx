import React from "react";
import { Box, render, Text, useFocus } from "ink";
import { SaveFile } from "../models/savefile.ts";
import { LanguageOption, SoundOption } from "../models/saveheader.ts";
import { Age } from "../models/saveslot.ts";
import { Scene, Time } from "../models/scene.ts";

interface SaveProps {
  filename: string;
}

const Save = ({ filename }: SaveProps): React.JSX.Element => {
  const file = Deno.openSync(filename);
  const saveFile = new SaveFile(file);
  file.close();

  return (
    <Box flexDirection="column">
      <Text>Save File {filename}</Text>
      <Text>Sound Option: {SoundOption[saveFile.header.soundOption]}</Text>
      <Text>
        Language Option: {LanguageOption[saveFile.header.languageOption]}
      </Text>
      <Text>Slot 1</Text>
      <Text>Age: {Age[saveFile.slots[0].age]}</Text>
      <Text>Rupees: {saveFile.slots[0].rupees}</Text>
      <Text>Player Name: {saveFile.slots[0].playerName}</Text>
      <Text>
        Health: {saveFile.slots[0].currentHealth / 16}/
        {saveFile.slots[0].maxHealth / 16}
      </Text>
      <Text>Scene: {Scene[saveFile.slots[0].savedSceneIndex]}</Text>
      <Text>Time: {Time[saveFile.slots[0].nightFlag]}</Text>
      <Text>Cutscene Number: {saveFile.slots[0].cutSceneNumber}</Text>
    </Box>
  );
};

const App = () => {
  const { isFocused } = useFocus();
  const width = Deno.consoleSize().columns;
  const height = Deno.consoleSize().rows;
  const filename: string = Deno.args[0];

  return (
    <Box
      width={width}
      height={height}
      flexDirection="column"
      gap="1"
      borderStyle="round"
      borderColor="white"
    >
      <Box flexDirection="row" justifyContent="center">
        <Text>Welcome to OOT Save Edit!</Text>
      </Box>
      {!!filename && filename.length > 0 ? <Save filename={filename} /> : (
        <Text>
          No file selected, please provide a filename as first argument.
        </Text>
      )}
    </Box>
  );
};

render(<App />);
