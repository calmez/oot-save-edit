# Save slot lifecycle

`new SraSaveFile()` creates one new-game slot in the first primary record and an
independent matching backup. The other four records are empty. Primary and
backup records use their pair's file index, from 0 to 2.

`SaveSlot.createEmpty(fileIndex)` creates an unused record;
`SaveSlot.createNewGame(fileIndex)` creates initialized starting progress. Both
default to index 0 and reject indexes outside 0–2. These replace the misleading
`SaveSlot.createBlank()` factory.

`resetSlotToNewGame(save, index)` replaces only the selected record, using
indexes 0–2 for primaries and 3–5 for backups. Its counterpart is unchanged;
synchronizing backups remains an explicit operation. This replaces `resetSlot`.
No delete-slot workflow is introduced.

Both editors distinguish empty slots from occupied records and require explicit
creation before editing an empty slot. Web and desktop use the same route and
editor. Reset controls describe replacement with a new-game slot.

## Format evidence

Evidence is pinned to
[zeldaret/oot revision 14759ab](https://github.com/zeldaret/oot/tree/14759abf9abb4295de142cdc1452998630ea70fb),
using the retail N64 branches, specifically NTSC 1.0, rather than debug
defaults.

[z_sram.c](https://github.com/zeldaret/oot/blob/14759abf9abb4295de142cdc1452998630ea70fb/src/code/z_sram.c):

- `Sram_InitNewSave` and its default tables initialize unused progress with a
  zero occupancy marker. `Sram_EraseSave` reuses this initialization.
- `Sram_InitSave` adds the occupied marker, child age, Link's House entrance,
  10:00 time, and opening cutscene, then writes matching primary/backup
  progress.
- Defaults include three hearts, empty inventory/buttons, Kokiri tunic/boots,
  unset dungeon keys, Epona's initial position, and the Water Temple switch and
  information-table initialization. The stored magic amount is 48 even though
  magic has not been acquired.

[save.h](https://github.com/zeldaret/oot/blob/14759abf9abb4295de142cdc1452998630ea70fb/include/save.h)
identifies the saved region and the runtime file-index field immediately after
it. The editor assigns destination indexes explicitly.

## Recognition and uncertainty

`isEmpty` conservatively recognizes zero-filled save information or the unused
default information above. It ignores the leading context, checksum, and runtime
tail, which can differ after in-game erasure. Arbitrary non-default progress
with a damaged marker remains damaged occupied data, not empty. Diagnosis is
read-only; checksum updates and `makeValid()` preserve recognized empty markers.
`isValid` continues to mean a checksum-valid occupied record; check `isEmpty`
separately.

An erased record and corruption that produces exactly the same unused
information cannot be distinguished from bytes alone. Other unused templates
remain unverified. The factories choose zero leading context and runtime padding
and calculate the empty checksum, rather than reproducing incidental runtime
residue from erasure. This evidence establishes the initialization layout, not
tested emulator or hardware compatibility; no such runtime verification was
performed for this change. The existing save fixture has no version provenance
and is not used as the source of initialization defaults.
