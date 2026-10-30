# Skulltula reconciliation evidence and boundaries

The initial mapping covers **three of the original game's 100 locations**. It
does not establish complete collection coverage. The fixtures are synthetic
source-backed examples, not saves observed in gameplay. No tested ROM/emulator
combination or exact game identity is claimed. Recognized SRAM alone does not
establish compatibility with modified games or randomizer behavior.

## Sources and derivation

Game sources are pinned to zeldaret/oot
`14759abf9abb4295de142cdc1452998630ea70fb`:

- [save.h](https://github.com/zeldaret/oot/blob/14759abf9abb4295de142cdc1452998630ea70fb/include/save.h):
  `SaveInfo` stores `gsFlags[6]` at slot offset `0xE9C`. `GET_GS_FLAGS` and
  `SET_GS_FLAGS` select a word by `group >> 2` and a byte by `group & 3`.
- [z_inventory.c](https://github.com/zeldaret/oot/blob/14759abf9abb4295de142cdc1452998630ea70fb/src/code/z_inventory.c):
  `gGsFlagsShifts` is `{0, 8, 16, 24}`. Thus group `0x0C` selects word 3's
  least-significant byte: canonical big-endian slot offset `0xEAB`.
- [z_parameter.c](https://github.com/zeldaret/oot/blob/14759abf9abb4295de142cdc1452998630ea70fb/src/code/z_parameter.c):
  `Item_Give(ITEM_SKULL_TOKEN)` sets quest bit `QUEST_SKULL_TOKEN` and
  increments `gsTokens`. The model's total is at `0xD0`; the indicator is mask
  `0x80` at `0xA5`. This supports offering the indicator for an
  acquisition-consistent outcome; it does not support clearing it at zero.
- [z_en_si.c](https://github.com/zeldaret/oot/blob/14759abf9abb4295de142cdc1452998630ea70fb/src/overlays/actors/ovl_En_Si/z_en_si.c):
  both pickup paths call `Item_Give`, then `func_80AFB950` sets the collection
  flag only when the pickup message closes. A snapshot can therefore show a
  temporary disagreement. A count/popcount mismatch alone does not prove damage.
- [z_en_sw.c](https://github.com/zeldaret/oot/blob/14759abf9abb4295de142cdc1452998630ea70fb/src/overlays/actors/ovl_En_Sw/z_en_sw.c):
  initialization tests the group and low-byte mask from actor parameters.

Named coordinates come from OoT Randomizer's
[LocationList.py](https://github.com/OoTRandomizer/OoT-Randomizer/blob/ea59907ab2641dc2117c8e1b6d35803a0782c4b0/LocationList.py),
pinned to `ea59907ab2641dc2117c8e1b6d35803a0782c4b0`. Its three `KF GS` entries
provide group `0x0C` and the masks below. This is a source interpretation of the
original Kokiri Forest mapping, cross-referenced against the game's storage and
actor rules; use of this project's location names does not establish support for
its modified gameplay. Its
[SaveContext.py](https://github.com/OoTRandomizer/OoT-Randomizer/blob/ea59907ab2641dc2117c8e1b6d35803a0782c4b0/SaveContext.py)
independently identifies the quest indicator and Pieces of Heart masks.

| Exposed location                 | Group  | Byte offset | Mask   |
| -------------------------------- | ------ | ----------- | ------ |
| Kokiri Forest: bean patch        | `0x0C` | `0xEAB`     | `0x01` |
| Kokiri Forest: Know-It-All House | `0x0C` | `0xEAB`     | `0x02` |
| Kokiri Forest: House of Twins    | `0x0C` | `0xEAB`     | `0x04` |

The exposed mask is `0x07`. It is **not** a complete mask for all six stored
words. All other bits remain uninterpreted, excluded from known collection
counts, and preserved. No named dungeon mapping or all-location preset is
exposed. The sources do not establish an invariant that removes the indicator,
or a way to reconstruct acquisition history from these fields.

## Operations and review

`prepareSkulltulaLocations` and `prepareSkulltulaTotal` return correction plans.
Both editors use the same plans through `CorrectionReview.stageSkulltula`.
Choosing these operations explicitly uses the displayed original N64 mapping;
the editor continues to report exact version and platform as unverified.

The request is staged on a copy. Preview includes its byte effects alongside
selected adjustments; confirmation applies the request and selected adjustments
only after validation. Cancel discards the request. Decline-all declines
dependent corrections while retaining the explicit request. A new request is
required to choose a different total or set of locations. Replacement of the
same destination in the same review is rejected.

Location intents preserve every unrequested bit and never recommend an absolute
total from partial coverage. Collecting a known location offers the evidenced
indicator adjustment selected by default; it can be declined. Total intents
preserve the requested total and all locations, explain totals below known
collections, and offer setting an absent indicator as an **unselected**
acquisition-consistent alternative. A manually requested total alone does not
prove acquisition. Zero never clears the indicator.

Stale record snapshots fail without writes. Refresh rebuilds the request and
requires another confirmation. Retain/allow choices resolve dependent-field
outcome conflicts explicitly. Checksum recalculation uses the final staged and
selected contents, remains separately declinable, and opting out sets export to
preserve stored checksums. Unrelated quest bits, Pieces of Heart, acquisition
history, backup records and unknown data remain unchanged.

## Fixtures

`utils/skulltulas.test.ts` seeds literal `0xEAB` values `0x80`, `0x81`, and
`0x83`: an unnamed bit, one known collection, and two known collections. It
exercises count disagreement and partial coverage without counting bit `0x80`.
Quest bytes `0xA0 0x41` exercise preservation of Pieces of Heart and unrelated
quest flags when setting the indicator. Core and editor interaction tests cover
both intents, decline/cancel/confirm, uncertainty, stale review, conflicts, and
checksum-preserving export. These fixtures demonstrate editor behavior against
source interpretations, not observed runtime compatibility.
