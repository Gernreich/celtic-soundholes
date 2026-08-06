# Celtic Sound Holes

Two Node generators that produce cut-ready SVG rosettes for an instrument sound hole.
Output is millimetre-true — `1 user unit = 1 mm`, with a physical `width`/`height` — so it
prints and cuts at real size.

**[Read the writeups](https://gernreich.github.io/celtic-soundholes/)** · plait:
[`celtic-knot-soundhole.md`](celtic-knot-soundhole.md) · torus knot:
[`celtic-torus-knot-soundhole.md`](celtic-torus-knot-soundhole.md)

## Which generator?

They differ in how many times the ribbon crosses itself, and neither can produce the
other's counts. An alternating over/under interlace has to close up when you return to
your start, and that decides the curve.

| | even crossings | odd crossings |
|---|---|---|
| Look | two-ribbon plait, braided | one continuous self-crossing strand |
| Crossings | `2N` — always even | `Q` — any odd integer ≥ 3 |
| Named forms | 6, 8, **10**, 12 | **trefoil**, cinquefoil, septafoil, nonafoil |
| Script | `celtic-knot-soundhole.js` | `celtic-torus-knot-soundhole.js` |
| Open area at r30 | 52.4% (default `N = 5`) | 63.3% (default `Q = 3`) |
| Rim anchors | `2N` | `Q` |

In the plait each strand meets every crossing once, so the count is even by
construction. A self-crossing strand visits each crossing twice, which is why a
3-crossing trefoil is a valid alternating knot. Asking the odd generator for an even `Q`
is refused with an error.

## Quick start

```
node celtic-knot-soundhole.js                          # report only, writes nothing
OUT=knot.svg node celtic-knot-soundhole.js             # 10-crossing plait, 60mm hole
Q=5 OUT=cinquefoil.svg node celtic-torus-knot-soundhole.js
```

**Nothing is written unless you set `OUT`.** A bare run prints the validation report and
exits, which is the cheapest way to see what a parameter change would do.

Every run prints a validation report. Read it — it is the point of the tools, not
decoration. `loose islands (CW)` must be `0`, or material falls out when cut.

## Before you cut

These are **cut-outs**: the removed material is the open area, and the ribbon is what
stays. A ribbon ring floating inside a round hole would drop out when the last cut
closes, so the ribbon peaks deliberately overrun the rim and fuse the rosette into the
soundboard. **There is no continuous rim circle in the cut layer** — the outer boundary
is a series of arcs between anchors. That is correct; adding a full circle drops the
rosette on the floor.

Delete the `preview` layer before sending to a cutter. The designs are very open (52% to
63% of the disc removed) and nothing here has been validated against real cut stock.

## Files

| | |
|---|---|
| `celtic-knot-soundhole.js` · `.md` | even-crossing plait generator and its writeup |
| `celtic-torus-knot-soundhole.js` · `.md` | odd-crossing torus-knot generator and its writeup |
| `celtic-*-r30.svg` | cut-ready samples at `R_HOLE = 30`, a 60 mm hole |
| `index.md` · `*.html` | the published pages; the markdown is the source |

Requires Node. No dependencies. Released under [CC0 1.0](LICENSE).
