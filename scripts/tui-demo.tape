# Run from the repository root: vhs scripts/tui-demo.tape
Require deno

Output demos/tui.gif

Set Shell "bash"
Set FontSize 16
Set Columns 140
Set Rows 40
Set Padding 16
Set Theme "Catppuccin Mocha"
Set Framerate 12
Set TypingSpeed 80ms
Set WaitTimeout 60s

# Reset the demo on every run, leaving the fixture untouched.
Hide
Type "demo_dir=$(mktemp -d) && cp test-data/new-game.sra $demo_dir/demo.sra && mkdir -p demos"
Enter
Sleep 500ms
Type "deno task run:tui $demo_dir/demo.sra"
Enter
Wait+Screen /Edit Save/
Show
Sleep 1s

# Open Slot 1 and focus Player Name (submit button and app precede it).
Type "4"
Sleep 500ms
Down 3
Wait+Screen /Player Name:.*Press enter to edit/
Sleep 500ms
Enter
Wait+Screen /Editing Player Name/
Backspace 8
Type "Link"
Sleep 500ms
Enter
Wait+Screen /Player Name: Link/
Sleep 1s

# Browse the next page of fields, then return.
Type "]"
Sleep 1500ms
Type "["
Sleep 500ms

# Synchronize the edited primary slots to their backups.
Ctrl+g
Wait+Screen /Choose action:/
Sleep 750ms
Down 4
Sleep 500ms
Enter
Wait+Screen /Updated. Save the file/
Sleep 1s
Escape
Wait+Screen /Edit Save/

# The remounted form has no focused field; Up selects the submit button.
Up
Wait+Screen /Press Enter to submit form/
Enter
Wait+Screen /Saved .*demo.sra/
Sleep 1500ms

# Finish on the synchronized backup, then hide process shutdown.
Type "7"
Wait+Screen /Player Name: Link/
Sleep 2s
Hide
Ctrl+c
