# OoT Save Edit

![Build Status](https://github.com/calmez/oot-save-edit/actions/workflows/main.yml/badge.svg)

⚠️ This project is still very much work in progress and not fully usable at this moment. ⚠️

This project was started out of desperation when having accidentally deleting my
save file on an N64 play-through very late in the game. Researching my options I
found excellent sources that explained the binary format of the save file.

<https://wiki.cloudmodding.com/oot/Save_Format>

Also this work is based on AdmiralCurtiss' very helpful
<https://github.com/AdmiralCurtiss/OoTSaveEditor>. My idea was to make it more
accessible to developers by rewriting this in Typescript. And it gave me a goo
excuse to try out Deno.

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

### UI

This will be quite essential to make this accessible to as many people as
possible. I am thinking of a more intuitive UI that makes sense for OoT players.
Probably I'll look into building it with React.

### App Bundling

It would be nice to bundle the application up into something that is easily
executable also for non techy users. I am really hoping to leverage deno's
`compile` command for that as it is also capable of cross compilation into a
basically dependency free binary.

### Lib Bundling

It would also be nice to publish a lib from this that other app devs can use to
not have to implement the save file handling. That would make it accessible for
devs to come up with more wild ideas than just a save file editor UI.
