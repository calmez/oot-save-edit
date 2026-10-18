# OoT Save Edit

![Build Status](https://github.com/calmez/oot-save-edit/actions/workflows/main.yml/badge.svg)
[![Docs](https://github.com/calmez/oot-save-edit/actions/workflows/pages/pages-build-deployment/badge.svg?branch=gh-pages)](https://calmez.github.io/oot-save-edit)

⚠️ This project is still very much work in progress and not fully usable at this
moment. ⚠️

This project was started out of desperation when having accidentally deleting my
save file on an N64 play-through very late in the game.

My idea was to make it more accessible to developers by rewriting this in
Typescript. And it gave me a good excuse to try out Deno - spoiler alert: it's
awesome.

## How this all started

I was playing OoT with my wife and we have been quite deep into the game when
something weird happened and we lost our save file. I then couldn't stand the
idea of having to start over since it felt like ironing over the great time that
we had with this game together. So I went out and looked at solutions and
knowledge about the save format of OoT. Luckily there is a ton of great sources.

My hyperfocus then got me knee deep into the topic. This is a great toy project
for me where I am experimenting a bit and hoping to grow as a developer.
Combining multiple things that I like and hopefully creating something useful
also to less techy people is what I aim for here.

## Using the editors

Run `deno task run:tui path/to/save.sra` to edit an existing SRA or SRM file.
Run `deno task run:tui --new` (or omit the filename) to start a new save. Use
the slot tabs for primary and backup saves, `[` and `]` for field pages, and
Ctrl+G for copy/restore, backup synchronization, reset, and repair actions.
Changes are written when you submit the save form.

Run `deno task web:dev` for the web editor or `deno task run:gui` for the
desktop wrapper after building the web UI. Both expose editable backup slots and
save-management controls. Download the save to keep your changes.

Both editors include additional progress and advanced data: saved child/adult
equipment, minigame records, individual Skulltula flags, world-map discovery,
Epona's position, and recorded Scarecrow songs. Arrays use comma-separated
integers; recorded song data uses hexadecimal bytes. Checksums are refreshed on
export, and SRM exports preserve the original emulator sections.

## Other Projects in this space

- [Game Tools Collection](https://github.com/RyudoSynbios/game-tools-collection)
- [OotSaveEditor](https://github.com/AdmiralCurtiss/OoTSaveEditor)
- [ZeldaSaveTool](https://github.com/xoascf/ZeldaSaveTool)

## More information about the save file

Researching my options I found excellent sources that explained the binary
format of the save file. <https://wiki.cloudmodding.com/oot/Save_Format>

Permanent scene flags are listed here <https://pastebin.com/nFCh8W8s>.

Also this work is based on [@AdmiralCurtiss](https://github.com/AdmiralCurtiss)'
very helpful [OotSaveEditor](https://github.com/AdmiralCurtiss/OoTSaveEditor).

Another helpful resource was
[this implementation](https://github.com/libretro/parallel-n64/blob/master/tools/pj64tosrm.c)
for handling `srm` files. In order to be compatible with libretro emulators.

<https://github.com/libretro/parallel-n64/blob/master/tools/pj64tosrm.c> was
very helpful to support libretro srm formats.

## Ideas for what to come next

I am using [issues](https://github.com/calmez/oot-save-edit/issues) for managing
development and ideas of what to integrate next. Feel free to drop me your ideas
as a [new issue](https://github.com/calmez/oot-save-edit/issues/new) to discuss
them together. I'd love to get you input.
