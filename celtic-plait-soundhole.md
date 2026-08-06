# Celtic Plait Sound Hole — even crossings (two woven ribbons)

Generator: `celtic-plait-soundhole.js`

Companion (odd crossings): [`celtic-knot-soundhole.md`](celtic-knot-soundhole.md)

Produces a cut-ready SVG of a circular Celtic plait sized for an instrument
sound hole. Two identical sinusoidal ribbons weave around a ring; ribbon B is
ribbon A rotated by `pi/N`.

Output is millimetre-true: `1 user unit = 1 mm`, with a physical `width`/
`height` in mm, so it prints and cuts at real size.

## The constraint that shapes the design

This is a **cut-out**. The removed material is the open area; the woven ribbon
is what stays. A ribbon ring floating inside a round hole would simply drop
out when the last cut closes.

So the ribbon peaks deliberately **overrun the rim by `BITE` mm**, fusing the
rosette into the soundboard at `2N` anchor points. `R_MID` is *derived*, not
chosen, to guarantee this:

```
R_MID = R_HOLE + BITE - AMP - HW
```

Consequence: **there is no continuous rim circle in the cut layer.** The outer
boundary is `2N` separate arcs between anchors. That is correct — do not
"fix" it by adding a full circle, or the rosette falls on the floor.

Because it is a single sheet cut through, true over/under cannot exist in the
material — at a crossing both ribbons are material and merge. The interlace is
suggested by the **engrave** layer instead.

## Why the crossing count is always even

Both ribbons are polar graphs `r(theta)`, and a point in the plane has a unique
`(r, theta)`, so they can only meet where `rA(theta) = rB(theta)`. That
difference is `2*AMP*sin(N*theta)` — exactly `2N` zeros per turn.

No parameter changes this. There is also a topological reason: each strand
meets every crossing once, and alternating over/under only closes up over an
even number. **For odd crossings use the companion generator.**

## Usage

```bash
node celtic-plait-soundhole.js                                      # report only, writes nothing
OUT=plait-10crossings-radius30mm.svg node celtic-plait-soundhole.js # N=5, the default
N=4 OUT=plait-8crossings-radius30mm.svg node celtic-plait-soundhole.js
R_HOLE=50 AMP=10.8 HW=3.3 BITE=2.5 OUT=plait-10crossings-radius50mm.svg node celtic-plait-soundhole.js
DIAG=1 node celtic-plait-soundhole.js                               # per-region dump
```

| Var | Default | Meaning |
|---|---|---|
| `R_HOLE` | `30` | sound hole radius, mm |
| `N` | `5` | lobes per ribbon → `2N` crossings and `2N` rim anchors |
| `AMP` | `6.5` | radial swing of the weave |
| `HW` | `2.0` | ribbon half-width → ribbon is `2*HW` mm wide |
| `BITE` | `1.5` | rim overrun; this is what anchors the rosette |
| `NG` | `1400` | sampling grid resolution |
| `MIN_FEATURE` | `0.25` | gaps narrower than this are welded to solid material |
| `OUT` | unset | output path — **nothing is written unless set** |
| `DIAG` | unset | verbose per-region report |

**The file that lands is not ready for the laser yet.** Its geometry is, but it
carries three layers and only one of them is a cut. See
[Output layers](#output-layers) before you send it: delete `preview`, and give the
blue `engrave` lines anything other than a cut.

`AMP` and `HW` do **not** auto-scale with `R_HOLE`. Roughly
`AMP ≈ 0.217*R_HOLE` and `HW ≈ 0.067*R_HOLE` reproduces these proportions;
a guard refuses geometry that cannot close and suggests values.

## Variants at R_HOLE=30 (60mm hole)

| `N` | Crossings | Regions | Open area | Equiv. plain hole | Narrowest cut | Slivers welded |
|---|---|---|---|---|---|---|
| 3 | 6 | 13 | 59.0% | 46.10mm | 4.03mm | 4 |
| 4 | 8 | 17 | 55.9% | 44.85mm | 3.54mm | 12 |
| **5** | **10** | **21** | **52.4%** | **43.45mm** | **3.10mm** | **0** |
| 6 | 12 | 25 | 48.9% | 41.96mm | 2.70mm | 0 |

Regions are always `4N + 1` — one centre star, plus a lens and a rim opening for
each of the `2N` crossings. (The count keys on crossings, not lobes: the
companion's rule is `2Q + 1` for its `Q` crossings, which is the same rule.)
Fewer crossings = bolder, more open weave. More crossings = finer and more
lace-like, with less open area.

## Output layers

Three groups, told apart by **stroke colour** as well as by `id`. Colour is the one that
survives the trip: many SVG importers flatten groups, and most laser software assigns
operations by colour rather than by group name.

| Group | Stroke | Purpose |
|---|---|---|
| `preview` | none — filled `#d8c9a8` | material fill, even-odd. **Delete before sending to a cutter.** |
| `cut` | **red `#ff0000`** | every closed path is waste that drops out |
| `engrave` | **blue `#0000ff`** | optional over/under interlace hints (`4N` polylines — two per crossing) |

**The blue lines must not be cut.** Give them a score or engrave operation, or delete the
layer. They run straight across the ribbon — at defaults they span radii 19.2 to 26.2mm
against a ribbon band of 21 to 25mm — so cutting them severs the ribbon at all `2N`
crossings, through exactly the material that holds the rosette together. It comes apart
as it leaves the machine.

Give every colour you keep an explicit operation. A per-colour job **silently skips any
colour you leave unmapped**: leave `cut` unmapped and you get an engraved picture of a
sound hole and no hole.

## How it works

```
signed distance field -> grid sample -> flood fill regions ->
weld unmanufacturable slivers -> marching squares -> chain segments ->
RDP simplify -> emit SVG
```

`field(x,y) > 0` means "cut away (air)", `< 0` means "material".

## Read the validation report

Printed on every run. This is the point of the tool, not decoration.

| Line | Must be |
|---|---|
| closed contours vs flood regions | equal, else loops were lost |
| unclosed chains | `0`, else a contour leaked |
| loose islands (CW) | `0` — a clockwise contour means material fully surrounded by air, which **falls out when cut** |
| contour area vs flood area | delta ≤ ~0.1%; two independent measurements of the same shape |

`slivers welded shut` is informational: grazing tangencies too narrow to cut,
turned into solid material. The count is resolution-dependent and harmless.

## Traps already sprung here

Both were **silent** — they produced plausible-looking output:

- **Chaining on rounded float coordinates.** Shared cell edges compute to
  slightly different values from each neighbouring cell, so loops fragment.
  Contours are keyed on integer grid-edge IDs instead.
- **Plain RDP on a closed loop.** `pts[0] == pts[last]` makes the baseline
  zero-length, every perpendicular distance zero, and the entire loop
  collapses to two points. See `rdpClosed`.

The marching-squares table also has a load-bearing invariant: segments are
oriented **inside-on-left**. Chaining depends on it, and so does the
loose-island check. Case 5's centre-inside branch was wrong first time round —
re-derive rather than trust it.

## Caveats

- Polylines only — no arc/bezier fitting, no kerf/tool-offset compensation,
  no DXF export.
- `MIN_FEATURE` guards minimum **air** width, not material width. Ribbon
  thickness is uniform `2*HW` by construction so it is fine in practice, but
  nothing verifies a thin material neck.
- Open area is large (≈52% at defaults). For a real soundboard consider what
  that removes structurally.
- Ribbon width has not been validated against actual cut stock.

## Generated files

- `celtic-plait-soundhole-10crossings-radius30mm.svg` — 10 crossings (N=5, default)
- `celtic-plait-soundhole-8crossings-radius30mm.svg` — 8 crossings (N=4)
