CHIP-5 -- an HTML5 CHIP-8 interpreter
=====================================

CHIP-5 is a [currently procedural] CHIP-8 interpreter utilising the
HTML5 Canvas, File, and Web Audio APIs.

Expect: future development effort to modularise (AMD) the core interpreter.

### Getting Started ###

CHIP-5 makes use of the File API to allow the player to choose a local CHIP-8
program to run. Simply click the 'Choose File' button and select a file from
your computer's file system.

There are a handful of CHIP-8 programs available online.  See [chip8.com](http://chip8.com/?page=84)
for a comprehensive list. A CHIP-8 Program Pack is also available for
[download](http://chip8.com/?page=109). Note that CHIP-5 presently supports the
original CHIP-8 (not SuperChip nor MegaChip8) instruction set.

### Key(s) ###

CHIP-5 translates QWERTY keyboard input to 16-key hexadecimal keypad input found
on the COSMAC VIP computer; the computer for which the CHIP-8 programming
language was originally devised.

```
QWERTY		COSMAC VIP

1 2 3 4		1 2 3 C

Q W E R		4 5 6 D

A S D F		7 8 9 E

Z X C V		A 0 B F
```

In addition to the keys listed above, the following keys perform the functions
outlined:

```
5 - reset
T - trace
G - go
```

NOTE: After loading a CHIP-8 program, press 'G' to run it.

### Play Now ###

[Play](http://andrewjbaker.github.com/CHIP-5/)

### TODO ###

- [ ] Modularise the JavaScript
- [ ] Add support for AZERTY (non-QWERTY) keyboard layout(s)
