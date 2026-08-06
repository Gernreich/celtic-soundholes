# Knotwork Sound Holes

Two Node generators that produce cut-ready SVG rosettes for an instrument sound hole.
Output is millimetre-true — `1 user unit = 1 mm`, with a physical `width`/`height` — so it
prints and cuts at real size.

**[Read the writeups](https://gernreich.github.io/knotwork-soundholes/)** · plait:
[`plait_soundhole.md`](plait_soundhole.md) · knot:
[`knot_soundhole.md`](knot_soundhole.md)

## Which generator?

They differ in whether the ribbon is one strand or two, and neither can produce the
other's shapes. Both are lead-and-bight knots — `L` leads by `B` bights — and `gcd(L, B)` is
the number of separate pieces you end up with. An alternating over/under interlace has to close up when you return to
your start, and that decides the curve.

| | even crossings | odd crossings |
|---|---|---|
| Look | two-ribbon plait, braided | one continuous self-crossing strand |
| Sized by | `N` lobes → `2N` crossings | `LEADS` × `BIGHTS`, coprime |
| Named forms | 6, 8, **10**, 12 crossings | **trefoil**, cinquefoil, septafoil, any coprime pair |
| Script | `plait_soundhole.js` | `knot_soundhole.js` |
| Open area at radius 30mm | 52.4% (default `N = 5`) | 63.3% at 2 × 3, 48.2% at 3 × 5 |
| Rim anchors | `2N` | `BIGHTS` |

In the plait each strand meets every crossing once, so the count is even by
construction. A self-crossing strand visits each crossing twice, which is why a
3-crossing trefoil is a valid alternating knot. Asking the odd generator for an even `Q`
is refused with an error.

## Quick start

```
node plait_soundhole.js                          # report only, writes nothing
OUT=10-crossing_plait_radius30mm.svg node plait_soundhole.js  # 10-crossing plait, 60mm hole
LEADS=2 BIGHTS=5 OUT=cinquefoil-radius30mm.svg node knot_soundhole.js
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
| `plait_soundhole.js` · `.md` | even-crossing plait generator and its writeup |
| `knot_soundhole.js` · `.md` | single-strand knot generator, any coprime leads × bights |
| `-*-radius30mm.svg` | samples at `R_HOLE = 30`, a 60 mm hole |
| `index.md` · `*.html` | the published pages; the markdown is the source |

Requires Node. No dependencies. Released under [CC0 1.0](LICENSE).
