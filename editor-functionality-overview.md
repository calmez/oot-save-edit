# TUI and GUI save-editing overview

**The TUI and GUI offer essentially the same editing capabilities.** The main
gaps are advanced fields that require raw data, limited coordination between
related game flags, and missing undo/change-review tools. The desktop GUI embeds
the web editor.

✓ = supported. “Raw” means entering numeric values, arrays, or hexadecimal
bytes.

| Functionality                          |      TUI      |   GUI    | Coverage and remaining gaps                                                                                                                                                                                                                 |
| -------------------------------------- | :-----------: | :------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Open or create saves**               |       ✓       |    ✓     | Load SRA/SRM files or create a new save. **Gap:** other save formats and emulator save states are unsupported.                                                                                                                              |
| **Save and convert files**             | Write to disk | Download | Choose filename, SRA/SRM format, and word swapping. Checksums update automatically; SRM exports preserve other emulator sections. GUI advanced text fields require **Apply** before downloading.                                            |
| **Primary and backup slots**           |       ✓       |    ✓     | Edit all three primary slots and three backups; copy/restore between slots and synchronize backups. **Gaps:** synchronization is manual; copying between separate files is unavailable.                                                     |
| **Repair and reset**                   |       ✓       |    ✓     | Repair the header, one slot, or everything; reset a slot to a new game. **Gap:** repair restores validity markers/checksums—it cannot reconstruct missing progress. Reset creates a new game rather than an empty slot.                     |
| **Game settings**                      |       ✓       |    ✓     | Language, sound mode, and Z-targeting behavior. Language choices are English, German, and French.                                                                                                                                           |
| **Player information**                 |       ✓       |    ✓     | Name, deaths, and child/adult age. **Gaps:** names accept only eight Latin letters; changing age does not coordinate equipment and story state.                                                                                             |
| **Health, magic, currency**            |       ✓       |    ✓     | Current/max health, double-defense hearts, magic acquisition and capacity, current magic, rupees, and bean counter. Heart-piece progress and the double-defense acquisition flag are also available under advanced data.                    |
| **Inventory and consumables**          |       ✓       |    ✓     | All inventory slots, bottle contents, trade items, and ammunition quantities. **Gap:** item choices and quantities are not comprehensively constrained by inventory position or acquired capacity.                                          |
| **Equipment and upgrades**             |       ✓       |    ✓     | Owned and currently equipped swords/shields/tunics/boots; quiver, bags, wallet, strength, scale, stick/nut capacities; button assignments and offsets. **Gap:** ownership, equipment, and button assignments remain independently editable. |
| **Saved child/adult equipment**        |      Raw      |   Raw    | Separate saved button items, inventory-slot assignments, and equipment words. **Gap:** no equivalent of the dedicated current-equipment controls.                                                                                           |
| **Quest rewards and dungeon items**    |       ✓       |    ✓     | Songs, medallions, stones, quest tokens, maps, compasses, boss keys, and small-key counts. **Gap:** granting rewards does not also complete the associated story events or dungeon state.                                                   |
| **Story and interaction flags**        |    ✓ + raw    | ✓ + raw  | Named event, item, and interaction flags; raw access includes unnamed bits. **Gaps:** no guided progression presets or dependency checking between flags.                                                                                   |
| **Permanent scene state**              |       ✓       |    ✓     | Chest, switch, room-clear, collectible, visited-room/floor, and unused bits across 124 scene entries. **Gap:** individual bits lack descriptions identifying the specific chest, switch, or collectible.                                    |
| **Skulltulas and map discovery**       |    ✓ + raw    | ✓ + raw  | Token count, individual Skulltula collection data, and discovered world-map areas. **Gaps:** collection/discovery fields use raw numbers; no location checklist or automatic reconciliation with the token count.                           |
| **Location and world state**           |       ✓       |    ✓     | Room/entrance selection, entrance index, saved scene, cutscene, world time, day/night, elapsed days, and Navi timer. **Gaps:** time uses numeric values; location, cutscene, and progress settings require manual coordination.             |
| **Farore’s Wind and Epona**            |    ✓ + raw    | ✓ + raw  | Warp coordinates/rotation, transport scene, map number, warp-set flag, temporary warp flags; Epona’s scene, position, and angle. **Gap:** no map-based placement or coordinated destination setup.                                          |
| **Records and miscellaneous progress** |      Raw      |   Raw    | Minigame records, Big Poe points, ocarina-game round, Giant’s Knife durability, Biggoron timing/acquisition, and raw equipment/upgrade words. **Gap:** most lack dedicated controls explaining their encoded values.                        |
| **Recorded Scarecrow songs**           |      Raw      |   Raw    | Recording flags and both song-data blocks. **Gap:** editing requires hexadecimal bytes; no note editor, playback, or recording interface.                                                                                                   |
| **Undo and review changes**            |       —       |    —     | **Missing:** application-level undo/redo, change preview, and a comprehensive game-state consistency check.                                                                                                                                 |

The biggest practical distinction is interaction: the **TUI uses tabs, paged
fields, and Ctrl+G management**, while the **GUI uses expandable sections,
checkboxes, and dropdowns**.

This is a source-level assessment based on the
[TUI editor](ui/terminal/save.tsx), [GUI editor](ui/web/islands/Slot.tsx),
[advanced-field definitions](models/additionaldata.ts), and
[save-management helpers](utils/saveeditor.ts); interactive behavior was not
tested. The [desktop wrapper](ui/main.ts) embeds the web editor.
