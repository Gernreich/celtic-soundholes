# Celtic Sound Holes

Two generators that produce cut-ready SVG rosettes for an instrument sound hole,
millimetre-true at `1 user unit = 1 mm`. Both emit a validation report on every run,
and that report — not the picture — is the point of the tools.

They differ in one thing, and it is not cosmetic: **whether the ribbon is one strand
or two.** An alternating over/under interlace has to close up when you return to your
start, and that constraint decides which curve you need.

| | [Two ribbons](celtic-plait-soundhole.md) | [One strand](celtic-knot-coprime-soundhole.md) |
|---|---|---|
| Look | plait, braided | one continuous self-crossing strand |
| Sized by | `N` lobes → `2N` crossings | `LEADS` × `BIGHTS` |
| Named forms | 6, 8, **10**, 12 crossings | **trefoil**, cinquefoil, septafoil, and any coprime pair |
| Generator | `celtic-plait-soundhole.js` | `celtic-knot-coprime-soundhole.js` |
| Open area at radius 30mm | 52.4% at the default `N = 5` | 63.3% at 2 × 3, 48.2% at 3 × 5 |
| Rim anchors | `2N` | `BIGHTS` |

## Why there are two: leads, bights, and one rule

Both are **Turk's heads**: `L` leads by `B` bights, where the strand travels round `L`
times and shows `B` scallops at the rim. Everything follows from one fact —
`gcd(L, B)` is the number of separate closed pieces you end up with.

| | leads | bights | `gcd` | strands | it is a… |
|---|---|---|---|---|---|
| [plait](celtic-plait-soundhole.md) | 2 | `2N`, even | 2 | 2 | **link** |
| [one strand](celtic-knot-coprime-soundhole.md) | any `L` | any `B` coprime to `L` | 1 | 1 | **knot** |

A knot is a *single* closed curve. Two woven ribbons are two curves, so the plait has
never been a knot in the strict sense, whatever the decorative tradition calls it — and
the coprime one is the design that earns the word.

That is why neither can produce the other's shapes. In the plait each strand meets every
crossing once, so its crossing count is even by construction; a self-crossing strand
visits each crossing twice, which is why a 3-crossing trefoil is a valid alternating
knot. Ask the coprime generator for a non-coprime pair and it refuses, listing the
bight counts that would work.

This reading is the mathematics set against the writeups' own descriptions, not
something measured out of the emitted geometry. The `gcd` argument is the load-bearing
part, and each writeup derives it independently.

## Which one do I want?

- **"A woven rosette, braided look, 12 crossings"** → [the plait](celtic-plait-soundhole.md).
- **"A trefoil sound hole"**, or one continuous ribbon you can trace with a finger → [the coprime generator](celtic-knot-coprime-soundhole.md) at `LEADS=2 BIGHTS=3`.
- **"A 3-lead 5-bight Turk's head"**, or anything named in leads and bights → [the coprime generator](celtic-knot-coprime-soundhole.md).
- **"N crossings"** where you named the number → an even count is the plait; an odd one is the coprime generator at 2 leads.

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
- [`celtic-turk-3x4-soundhole-radius30mm.svg`](celtic-turk-3x4-soundhole-radius30mm.svg) — 3 leads × 4 bights
- [`celtic-turk-3x5-soundhole-radius30mm.svg`](celtic-turk-3x5-soundhole-radius30mm.svg) — 3 leads × 5 bights

Requires Node. Neither generator writes anything unless you set `OUT`.

Released under CC0 1.0.
