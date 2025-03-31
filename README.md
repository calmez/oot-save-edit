# OoT Save Edit

![Build Status](https://github.com/calmez/oot-save-edit/actions/workflows/main.yml/badge.svg)
[![Docs](https://github.com/calmez/oot-save-edit/actions/workflows/pages/pages-build-deployment/badge.svg?branch=gh-pages)](https://calmez.github.io/oot-save-edit)

⚠️ This project is still very much work in progress and not fully usable at this
moment. ⚠️

This project was started out of desperation when having accidentally deleting my
save file on an N64 play-through very late in the game.

Researching my options I found excellent sources that explained the binary
format of the save file. <https://wiki.cloudmodding.com/oot/Save_Format>

Also this work is based on [@AdmiralCurtiss](https://github.com/AdmiralCurtiss)'
very helpful [OotSaveEditor](https://github.com/AdmiralCurtiss/OoTSaveEditor).

Another helpful resource was
[this implementation](https://github.com/libretro/parallel-n64/blob/master/tools/pj64tosrm.c)
for handling `srm` files. In order to be compatible with libretro emulators.

My idea was to make it more accessible to developers by rewriting this in
Typescript. And it gave me a good excuse to try out Deno - spoiler alert: it's
awesome.

<https://github.com/libretro/parallel-n64/blob/master/tools/pj64tosrm.c> was very helpful to support libretro srm formats.

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

## Ideas for what to come next

I am using [issues](https://github.com/calmez/oot-save-edit/issues) for managing
development and ideas of what to integrate next. Feel free to drop me your ideas
as a [new issue](https://github.com/calmez/oot-save-edit/issues/new) to discuss
them together. I'd love to get you input.
