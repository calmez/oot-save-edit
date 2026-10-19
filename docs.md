## Getting Started

To get started parsing a save file you will want to use
[`FileUtil`](./classes/FileUtil.html#loadfile) with a filepath to read a SRA or
SRM file from.

## Exporting edited saves

### SRAM byte order

All export paths accept `ExportByteOrder`: `FileUtil.getFileData` and
`saveFile`, model `getData`, `getDataForWrite`, `write`, and
`SrmSaveFile.fromSaveFile`. The terminal and web editors expose the same choices
as **SRAM Byte Order**.

| Choice        | Result                                                                                                               |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| `Automatic`   | Preserve detected source order for the same format. New files and conversions use the target layout's default below. |
| `BigEndian`   | SRAM bytes in cartridge order, regardless of source order or output format.                                          |
| `WordSwapped` | Reverse each four-byte SRAM word relative to cartridge order, regardless of source order or output format.           |

Four-byte word swapping means `[0x12, 0x34, 0x56, 0x78]` becomes
`[0x78, 0x56, 0x34, 0x12]`. `FileUtil.byteSwap` implements this operation and
returns a copy unless `inPlace` is true. For arbitrary buffers, a final partial
word is reversed within its available bytes; supported SRAM images contain
complete words. Order changes apply to the whole `0x8000`-byte SRAM region,
including its unknown tail. In SRM, only offsets `0x20800`–`0x287FF` change
order; EEPROM, all four MemPaks, and FlashRAM retain their bytes.

The supported target representation defaults are:

- **SRA**: raw cartridge SRAM in big-endian order. This follows the original N64
  save-memory layout and direct SRAM transfers described by the
  [OoT save format](https://wiki.cloudmodding.com/oot/Save_Format) and
  [matching OoT decompilation](https://github.com/zeldaret/oot/blob/main/src/code/z_sram.c).
- **SRM**: the `0x48800`-byte Mupen64Plus-Next container on **little-endian
  hosts**, with word-swapped SRAM. Its
  [container structure](https://github.com/libretro/mupen64plus-libretro-nx/blob/develop/libretro/libretro_memory.h),
  [save-memory export](https://github.com/libretro/mupen64plus-libretro-nx/blob/develop/libretro/libretro.c),
  [SRAM access](https://github.com/libretro/mupen64plus-libretro-nx/blob/develop/mupen64plus-core/src/device/cart/sram.c),
  and
  [host-order macros](https://github.com/libretro/mupen64plus-libretro-nx/blob/develop/mupen64plus-core/src/osal/preproc.h)
  establish the section offsets and four-byte reversal on little-endian hosts.

These defaults are verified against the referenced layout/code, checked on
2026-10-19, rather than an end-to-end game/platform compatibility matrix. File
size recognizes a layout; it does not verify an emulator or game version. Other
SRM layouts and big-endian-host defaults are unverified. Existing files can
retain either detected order, and explicit choices deliberately override these
defaults. Fresh SRM containers still use provisional zero-filled non-SRAM
sections; verifying their initialization is tracked separately in issue #101.

Extracting SRA from a loaded SRM is a conversion, so automatic SRA export uses
big-endian order. Exporting the same working save back to SRM preserves the
original SRAM order and reuses its container. Exporting a preview never changes
that source metadata or the working bytes.

`SraSaveFile.read(source, knownOrder)` accepts an already known source order,
which the SRM adapter passes through even if the header marker was edited.
Omitting it uses header detection; this does not resolve ambiguous input.

```typescript
import { ExportByteOrder, FileFormat, FileUtil } from "./index.ts";

const save = FileUtil.loadFile("game.srm");
const automatic = FileUtil.getFileData(save, FileFormat.SRM);
const bigEndian = FileUtil.getFileData(
  save,
  FileFormat.SRM,
  ExportByteOrder.BigEndian,
);
```

This replaces the provisional boolean `forceSwap` API. Replace `false` with
`ExportByteOrder.Automatic`; replace `true` with the desired **result**,
`BigEndian` or `WordSwapped`. The old boolean is rejected. The order argument
precedes the checksum policy in every export method, including
`getDataForWrite(order, checksumPolicy)` and
`SrmSaveFile.fromSaveFile(save, order, checksumPolicy)`.

### Checksums

`FileUtil.getFileData` returns an export copy. By default it maintains checksums
only for primary or backup slots whose non-checksum bytes differ from the loaded
record (or the initial record for a new save). Untouched invalid checksums
remain available through `slot.isChecksumValid()`; export does not repair
validity markers, synchronize backups, or initialize empty slots. Preparing
download data leaves the working save unchanged.

Use `ChecksumPolicy.Preserve` to retain stored checksum bytes even after editing
content:

```typescript
import {
  ChecksumPolicy,
  ExportByteOrder,
  FileFormat,
  FileUtil,
} from "./index.ts";

const save = FileUtil.loadFile("game.sra");
save.slots[0].rupees = 500;

const output = FileUtil.getFileData(save, FileFormat.SRA);
const preserved = FileUtil.getFileData(
  save,
  FileFormat.SRA,
  ExportByteOrder.Automatic,
  ChecksumPolicy.Preserve,
);
```

`FileUtil.saveFile` accepts the same policy after its byte-order argument.
`SraSaveFile.getDataForWrite` and `write` also maintain edited-slot checksums by
default. Raw snapshots through `getData()` or `data`, and conversion through
`SrmSaveFile.fromSaveFile`, preserve stored checksums by default.

For an explicit checksum-only repair, call `slot.updateChecksum()` on the chosen
record. This changes its stored checksum without rewriting its validity marker
or other records. `slot.makeValid()` additionally repairs the validity marker.
