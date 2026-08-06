# Celtic Sound Holes

Two generators that produce cut-ready SVG rosettes for an instrument sound hole,
millimetre-true at `1 user unit = 1 mm`. Both emit a validation report on every run,
and that report — not the picture — is the point of the tools.

They differ in one thing, and it is not cosmetic: **how many times the ribbon crosses
itself.** An alternating over/under interlace has to close up when you return to your
start, and that constraint decides which curve you need.

| | [Even crossings](celtic-plait-soundhole.md) | [Odd crossings](celtic-knot-soundhole.md) |
|---|---|---|
| Look | two-ribbon plait, braided | one continuous self-crossing strand |
| Crossings | `2N` — always even, for any parameters | `Q` — any odd integer ≥ 3 |
| Named forms | 6, 8, **10**, 12 crossings | **trefoil**, cinquefoil, septafoil, nonafoil |
| Generator | `celtic-plait-soundhole.js` | `celtic-knot-soundhole.js` |
| Open area at radius 30mm | 52.4% at the default `N = 5` | 63.3% at the default `Q = 3` |
| Rim anchors | `2N` | `Q` |

Neither generator can produce the other's crossing counts. In the plait each strand
meets every crossing once, so the count is even by construction; a self-crossing strand
visits each crossing twice, which is why a 3-crossing trefoil is a valid alternating
knot. Asking the knot generator for an even `Q` is refused with an error.

## Why there are two, and why they are named that way

Both generators trace the same family of curve — **two strands winding around a ring**
with `n` crossings between them. What changes with `n` is how many separate pieces of
ribbon you end up with, and that is `gcd(2, n)`:

| `n` crossings | components | it is a… | generator |
|---|---|---|---|
| **even** | 2 — two closed ribbons woven together | **link** | plait |
| **odd** | 1 — one strand crossing itself | **knot** | knot |

A knot is a *single* closed curve. Two woven ribbons are two curves, so the even design
has never been a knot in the strict sense, whatever the decorative tradition calls it —
it is a plait, and the odd design is the one that earns the word. That is the whole
reason for the split, and it is why no parameter will make one produce the other's
crossing counts.

This naming is a reading of the mathematics against the writeups' own descriptions, not
something measured out of the emitted geometry. The `gcd` argument is the load-bearing
part, and each writeup derives it independently.

## Which one do I want?

- **"A woven rosette, braided look, 12 crossings"** → even. [Read the plait writeup](celtic-plait-soundhole.md).
- **"A trefoil sound hole"**, or one continuous ribbon you can trace with a finger → odd. [Read the knot writeup](celtic-knot-soundhole.md).
- **"N crossings"** where you named the number → odd count routes to the knot, even to the plait.

## Before you cut

These are **cut-outs**: the removed material is the open area and the ribbon is what
stays. A ribbon ring floating inside a round hole would drop out when the last cut
closes, so the ribbon peaks deliberately overrun the rim and fuse the rosette into the
soundboard. **There is no continuous rim circle in the cut layer** — the outer boundary
is a series of arcs between anchors. That is correct. Do not "fix" it by adding a full
circle, or the rosette falls on the floor.

Both designs are very open — 49% to 63% of the disc removed across the documented
variants, 52% and 63% at the two defaults. Three anchors are enough to fix a trefoil's
plane, but that is a kinematic statement, not a stiffness one. Nothing here has been
validated against real cut stock.

**Two layers are not cuts.** Delete the `preview` layer before sending anything to a
cutter, and give the blue `#0000ff` `engrave` lines a score or engrave operation rather
than a cut — they run across the ribbon at every crossing, so cutting them takes the
rosette apart. Only the red `#ff0000` `cut` layer is meant to go through the material.
Each writeup has the full table.

## Sample files

Output at `R_HOLE = 30` (a 60 mm hole), committed so you can look before you run anything.
The geometry is cut-ready; the layers still need the two minutes described above.

- [`celtic-plait-soundhole-10crossings-radius30mm.svg`](celtic-plait-soundhole-10crossings-radius30mm.svg) — 10 crossings, `N = 5`
- [`celtic-plait-soundhole-8crossings-radius30mm.svg`](celtic-plait-soundhole-8crossings-radius30mm.svg) — 8 crossings, `N = 4`
- [`celtic-trefoil-soundhole-radius30mm.svg`](celtic-trefoil-soundhole-radius30mm.svg) — `Q = 3`
- [`celtic-cinquefoil-soundhole-radius30mm.svg`](celtic-cinquefoil-soundhole-radius30mm.svg) — `Q = 5`
- [`celtic-septafoil-soundhole-radius30mm.svg`](celtic-septafoil-soundhole-radius30mm.svg) — `Q = 7`

Requires Node. Neither generator writes anything unless you set `OUT`.

Released under CC0 1.0.
