# Ocarina of Time Saves

Shared language for editing saves from the original N64 Ocarina of Time,
including recovering progress, replaying parts of the game, and exploring game
internals.

## Language

### Save formats

**SRA**: An image of the original game's SRAM save data.

**SRM**: An emulator save container that includes the game's SRAM data alongside
other save-memory sections.

**Recognized layout**: A save-memory structure whose organization the editor can
identify.

**Verified compatibility**: Evidence that save handling works with an identified
game version and emulator or platform combination.

### Slots

**Primary slot**: A slot containing the progress associated with one of the
game's save selections.

**Backup slot**: A recovery copy paired with a primary slot, which may contain
different progress.

**Empty slot**: A slot with no initialized game. _Avoid_: New-game slot

**New-game slot**: A slot containing initialized starting progress for a new
playthrough. _Avoid_: Empty slot, blank slot

### Save integrity and game state

**Structural validity**: A save's compliance with the file format's integrity
requirements, including validity markers and checksums. Structural validity does
not establish gameplay consistency.

**Gameplay consistency**: Agreement among a save's related inventory, equipment,
progression, and world-state values according to the game's rules.

### Inventory, equipment, and progression

**Inventory slot**: A position for an item, such as a bottle position or a
trade-item position.

**Inventory item**: The item occupying an inventory slot, including bottle
contents and trade items.

**Owned equipment**: Acquired swords, shields, tunics, and boots. _Avoid_:
Equipped equipment

**Equipped equipment**: The equipment currently selected for Link. _Avoid_:
Owned equipment

**Button assignment**: The item assigned to an action button.

**Saved equipment**: Equipment and button assignments remembered separately for
Link's child and adult forms.

**Upgrade tier**: The selected capacity or ability level within an upgrade
category.

**Quest status**: Acquired quest rewards and learned songs, separately from
their acquisition history. _Avoid_: Dungeon completion

**Acquisition history**: Recorded events describing how items or rewards were
obtained, independently of whether they are currently possessed. _Avoid_:
Possession

**Permanent scene state**: Persistent state associated with a scene, such as
opened chests, switches, collected objects, and visited rooms or floors.

### Locations

**Scene**: A game area, such as a dungeon interior or an overworld area, which
may contain multiple rooms. _Avoid_: Room (for an entire scene)

**Scene identifier**: The identity of a scene, independent of the entrance used
to enter it. _Avoid_: Entrance index

**Entrance-table entry**: A game entry describing how Link enters a scene,
including the applicable age or time variant. _Avoid_: Scene

**Room**: A subdivision within a scene. _Avoid_: Scene
