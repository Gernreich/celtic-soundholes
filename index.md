# Celtic Sound Holes

Two generators that produce cut-ready SVG rosettes for an instrument sound hole,
millimetre-true at `1 user unit = 1 mm`. Both emit a validation report on every run,
and that report — not the picture — is the point of the tools.

They differ in one thing, and it is not cosmetic: **how many times the ribbon crosses
itself.** An alternating over/under interlace has to close up when you return to your
start, and that constraint decides which curve you need.

| | [Even crossings](celtic-knot-soundhole.md) | [Odd crossings](celtic-torus-soundhole.md) |
|---|---|---|
| Look | two-ribbon plait, braided | one continuous self-crossing strand |
| Crossings | `2N` — always even, for any parameters | `Q` — any odd integer ≥ 3 |
| Named forms | 6, 8, **10**, 12 crossings | **trefoil**, cinquefoil, septafoil, nonafoil |
| Generator | `celtic-knot-soundhole.js` | `celtic-torus-soundhole.js` |
| Open area at r30 | 52.4% at the default `N = 5` | 63.3% at the default `Q = 3` |
| Rim anchors | `2N` | `Q` |

Neither generator can produce the other's crossing counts. In the plait each strand
meets every crossing once, so the count is even by construction; a self-crossing strand
visits each crossing twice, which is why a 3-crossing trefoil is a valid alternating
knot. Asking the odd generator for an even `Q` is refused with an error.

## Which one do I want?

- **"A woven rosette, braided look, 12 crossings"** → even. [Read the plait writeup](celtic-knot-soundhole.md).
- **"A trefoil sound hole"**, or one continuous ribbon you can trace with a finger → odd. [Read the torus-knot writeup](celtic-torus-soundhole.md).
- **"N crossings"** where you named the number → odd count routes to the torus knot, even to the plait.

## Before you cut

These are **cut-outs**: the removed material is the open area and the ribbon is what
stays. A ribbon ring floating inside a round hole would drop out when the last cut
closes, so the ribbon peaks deliberately overrun the rim and fuse the rosette into the
soundboard. **There is no continuous rim circle in the cut layer** — the outer boundary
is a series of arcs between anchors. That is correct. Do not "fix" it by adding a full
circle, or the rosette falls on the floor.

Both designs are very open — 52% to 63% of the disc removed. Three anchors are enough to
fix a trefoil's plane, but that is a kinematic statement, not a stiffness one. Nothing
here has been validated against real cut stock.

Delete the `preview` layer before sending anything to a cutter.

## Sample files

Cut-ready output at `R_HOLE = 30` (a 60 mm hole), committed so you can look before you run
anything:

- [`celtic-knot-soundhole-r30.svg`](celtic-knot-soundhole-r30.svg) — 10 crossings, `N = 5`
- [`celtic-knot-soundhole-r30-8x.svg`](celtic-knot-soundhole-r30-8x.svg) — 8 crossings, `N = 4`
- [`celtic-trefoil-soundhole-r30.svg`](celtic-trefoil-soundhole-r30.svg) — `Q = 3`
- [`celtic-cinquefoil-soundhole-r30.svg`](celtic-cinquefoil-soundhole-r30.svg) — `Q = 5`
- [`celtic-septafoil-soundhole-r30.svg`](celtic-septafoil-soundhole-r30.svg) — `Q = 7`

Requires Node. Neither generator writes anything unless you set `OUT`.

Released under CC0 1.0.
