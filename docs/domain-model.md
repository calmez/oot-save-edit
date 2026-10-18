# Domain model

The editor covers original N64 Ocarina of Time saves in the known SRA and SRM
layouts. Other game versions, modified games, save states, and container formats
require explicit support decisions. A recognized layout establishes less than
verified compatibility with a particular game version and emulator or platform.

Use the [glossary](../GLOSSARY.md) for domain definitions and the
[ADR index](adr/README.md) for decisions and their rationale. The notes below
connect that language to the existing code; agreed directions may still have
implementation gaps.

## Slot lifecycle

Creating a new save file should initialize the first primary slot and its
matching backup as a new game, leaving the other two pairs empty. Creating
additional games is an explicit choice.

Currently, `new SraSaveFile()` initializes all six records as new games.
`SaveSlot.createBlank()` also means an initialized new game. These names and
defaults should be aligned with the distinction between an empty slot and a
new-game slot.

## Gameplay relationships

Possession, acquisition history, and current world state are distinct facts.
Relationships between them must be established individually; an acquisition
event does not necessarily establish present possession, and possession alone
does not establish how an item was acquired.

A normal change-age operation should evaluate active equipment, saved
child/adult equipment, and location compatibility, then suggest supported
adjustments for the requested outcome. Currently, setting `SaveSlot.age` changes
only the age field.

Collection counts and individual location records have no universal precedence.
For example, marking particular Skulltulas collected can suggest updating the
total, while requesting a particular total must explain disagreements without
inventing which locations were collected. The quest-status indicator, total, and
individual records are distinct representations requiring verified
relationships.

The event, item, and other flag groups reflect different stored regions with
overlapping subject matter. Similar labels in different groups are not
sufficient evidence that they are aliases or that one can be reconstructed from
another.

## Legacy names and overlapping representations

| Current code                          | Interpretation for agents                                                                                                                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Room`                                | Names game areas, including entire dungeons and overworld areas; it is not a list of subdivisions within scenes.                                                                                            |
| `Scene`                               | Names expanded entrance-table entries, including age/time variants. It is not the namespace of scene identifiers.                                                                                           |
| `savedSceneIndex`                     | Represents a saved scene identifier despite its current `Scene` annotation.                                                                                                                                 |
| Permanent-scene record index          | Uses scene identity, separately from entrance-table indexes.                                                                                                                                                |
| `entranceIndexTransport`, `mapNumber` | Tentative Farore's Wind interpretations; verify their namespaces before relying on their names or types.                                                                                                    |
| `biggoronsSwordFlag1`                 | A lossy view of the same bytes exposed as `additionalData.swordHealth`: nonzero reads as true, while writing true replaces the value with 8. The name is insufficient evidence of Biggoron Sword ownership. |
| A flag coordinate named `byte`        | Indexes an element of the backing typed array, whose width varies between flag groups. It is not uniformly a byte offset.                                                                                   |

These are interpretation hazards, not stable API requirements. Apply the
[evidence policy](adr/0009-ground-interpretation-in-version-specific-evidence.md)
when resolving them and the
[API evolution policy](adr/0006-keep-the-core-independent-of-ui-and-deno.md)
when changing their interfaces.
