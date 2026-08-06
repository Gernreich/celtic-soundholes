# Celtic Coprime Turk's Head Sound Hole — any leads × bights

Generator: `celtic-knot-coprime-soundhole.js`

Companion: [`celtic-plait-soundhole.md`](celtic-plait-soundhole.md) (two ribbons,
even crossings)

Replaces `celtic-knot-soundhole.js`, which handled two leads only. Set `LEADS=2` and
this produces that generator's output exactly — verified file by file, cut layer
byte-identical and the same set of engrave subpaths.

Produces a cut-ready SVG rosette for an instrument sound hole, sized in the terms a
knot-tyer already uses: **L leads by B bights**. The strand travels round `L` times
before it closes, and shows `B` scallops at the rim. Millimetre-true output,
`1 user unit = 1 mm`.

```
r(theta) = R_MID + AMP*cos(B*theta/L),   theta in [0, 2*pi*L)
```

It generalises the two-lead generator this replaced: `BIGHTS` odd is exactly that
one's rule that `Q` must be odd, because odd `B` is what makes `gcd(2, B) = 1`.

## Leads and bights, and why they must be coprime

The strand closes into **one** piece iff `gcd(L, B) = 1`. That is not a convention,
it is what the curve does: `gcd(L, B)` counts the separate closed pieces you end up
with. Ask for 3 leads and 6 bights and you get three loops lying alongside each
other, with no single ribbon to trace and no interlace to alternate over. The
generator refuses, and lists the coprime bight counts near the leads you asked for.

The companions are both the `L = 2` row of the same table:

| generator | leads | bights | `gcd` | strands |
|---|---|---|---|---|
| the retired knot generator | 2 | `Q`, odd | 1 | 1 — a knot |
| [plait](celtic-plait-soundhole.md) | 2 | `2N`, even | 2 | 2 — a plait |
| this one | any `L` | any `B` coprime to `L` | 1 | 1 |

## The structural constraint

Same as both companions. This is a **cut-out**: the removed material is the open
area and the ribbon is what stays. A ribbon ring floating inside a round hole would
drop out when the last cut closes, so the ribbon peaks deliberately overrun the rim
by `BITE` mm and fuse the rosette into the soundboard at `B` anchor points. **There
is no continuous rim circle in the cut layer** — the outer boundary is `B` arcs.
That is correct; adding a full circle drops the rosette on the floor.

## Usage

```bash
node celtic-knot-coprime-soundhole.js                          # report only, writes nothing
LEADS=3 BIGHTS=5 OUT=turk-3x5-radius30mm.svg node celtic-knot-coprime-soundhole.js
LEADS=3 BIGHTS=4 OUT=turk-3x4-radius30mm.svg node celtic-knot-coprime-soundhole.js
LEADS=2 BIGHTS=3 node celtic-knot-coprime-soundhole.js         # the trefoil again
SELFTEST=1 node celtic-knot-coprime-soundhole.js               # check the hash, exit
DIAG=1 node celtic-knot-coprime-soundhole.js                   # per-region dump
```

**The file that lands is not ready for the laser yet.** Its geometry is, but it
carries three layers and only one of them is a cut. See
[Output layers](#output-layers) before you send it: delete `preview`, and give the
blue `engrave` lines anything other than a cut.

| Var | Default | Meaning |
|---|---|---|
| `LEADS` | `3` | times round before the strand closes |
| `BIGHTS` | `5` | scallops at the rim; must be coprime to `LEADS` |
| `R_HOLE` | `30` | sound hole radius, mm |
| `AMP` | `7.5` | radial swing of the weave |
| `HW` | `2.0` | ribbon half-width → ribbon is `2*HW` mm wide |
| `BITE` | `1.5` | rim overrun; this is what anchors the rosette |
| `NG` | `1400` | sampling grid resolution |
| `MIN_FEATURE` | `0.25` | gaps narrower than this are welded to solid material |
| `OUT` | unset | output path — **nothing is written unless set** |
| `SELFTEST` | unset | verify spatial hash against brute force, then exit |
| `DIAG` | unset | verbose per-region report |

Neither `AMP` nor `HW` auto-scales with `R_HOLE`; roughly `AMP ≈ 0.25*R_HOLE` and
`HW ≈ 0.067*R_HOLE`. More leads pack more ribbon into the same annulus, so expect
to reduce both as `LEADS` goes up — though see the envelope below, because that is
not enough to rescue the crowded cases.

`Q` is not a setting. It was the bight count of the retired two-lead generator, and
because ignoring it would quietly hand back the defaults instead — `Q=5` giving a
3 × 5, not a cinquefoil — it is refused with the `LEADS=2 BIGHTS=5` form to type
instead.

### The centre opening is derived, and it can abort the run

```
R_CENTRE = R_HOLE + BITE - 2*(AMP + HW)
```

The generator **exits 1** if that drops below 1mm. So shrinking `R_HOLE` while
leaving `AMP`/`HW` at their defaults does not give you a tighter knot, it refuses to
run — at defaults it aborts below `R_HOLE ≈ 18.5`. Scale both with the rules of
thumb above and `R_CENTRE ≈ 0.37*R_HOLE + BITE`. The `BITE` term does not scale, so
the ratio is not constant: **0.42** at the 30mm default, 0.40 at 50mm, 0.38 at
100mm, approaching 0.37 only well above that.

This one depends on `AMP`, `HW`, `BITE` and `R_HOLE` alone — leads and bights do not
enter it.

### Sampling and the error floor

The centreline is sampled at a fixed `M = 20000` points — not exposed as a variable
— and distance is measured to those samples, so it **overestimates** by up to half
the sample spacing. Those `M` points now cover `L` turns rather than two, so the
spacing grows with leads as well as with bights and the `AMP*B/L` radial derivative.
It stays an order of magnitude under the 0.25mm `MIN_FEATURE` floor across the
tested range, but the margin narrows as either number rises — and long before
sampling becomes the limit, `MIN_FEATURE` does. See the envelope below.

## Variants at R_HOLE=30 (60mm hole)

| `L` × `B` | Regions | Crossings | Anchors | Engrave | Open area | Equiv. plain hole | Narrowest cut |
|---|---|---|---|---|---|---|---|
| 2 × 3 | 7 | 3 | 3 | 6 | 63.3% | 47.73mm | 5.51mm |
| 3 × 2 | 7 | 4 | 2 | 8 | 50.7% | 42.72mm | 2.21mm |
| **3 × 4** | **13** | **8** | **4** | **16** | **49.2%** | **42.10mm** | **2.07mm** |
| **3 × 5** | **16** | **10** | **5** | **20** | **48.2%** | **41.64mm** | **2.01mm** |
| 4 × 3 | 13 | 9 | 3 | 18 | 39.4% | 37.66mm | **0.66mm** |

`2 × 3` is the trefoil, reproduced here to show the generalisation is faithful.
`4 × 3` is included as a warning as much as an option: it satisfies every invariant,
but a 0.66mm narrowest cut is delicate against a kerf of 0.1–0.2mm.

More leads means less open area, because more ribbon is packed into the same ring.

## Invariants — these pin the topology

```
crossings     == B*(L-1)
cut regions   == L*B + 1     (one centre + B*(L-1) lenses + B rim gaps)
rim anchors   == B
engrave lines == 2*B*(L-1)   (two edges of the over pass per crossing)
```

Both companions are the `L = 2` case: the knot at `(2, Q)` gives `2Q + 1` regions,
and the plait at `(2, 2N)` gives `4N + 1`. **The generator checks the crossing and
region counts on every run and prints whether they match.**

## The tested envelope, and where it stops

Verified against every invariant at `(2,3) (2,5) (2,9) (3,2) (3,4) (3,5)` and
`(4,3)`. `(2,3)` reproduced the retired `celtic-knot-soundhole.js` exactly — identical
validation block, areas and sliver count, only the report wording differs. That
equivalence is the evidence the generalisation is faithful rather than plausible.

It degrades above that, and **the limit is manufacturability, not topology**. As
leads rise, the lens regions between passes shrink below `MIN_FEATURE` and are
welded shut, so they never become separate cut regions. At `(4,5)` the region count
falls short of `L*B + 1` by exactly the welded lenses; at `(5,2)` the crossing
detector loses them too and reports 2 against a predicted 8.

Reducing `AMP` and `HW` does not rescue it. The passes crowd because there are five
of them in one annulus, not because the ribbon is fat.

**Judge by the region and crossing counts, not by the sliver count** — see
[the validation report](#read-the-validation-report) for why.

## Output layers

Three groups, told apart by **stroke colour** as well as by `id`. Colour is the one
that survives the trip: many SVG importers flatten groups, and most laser software
assigns operations by colour rather than by group name.

| Group | Stroke | Purpose |
|---|---|---|
| `preview` | none — filled `#d8c9a8` | material fill, even-odd. **Delete before sending to a cutter.** |
| `cut` | **red `#ff0000`** | every closed path is waste that drops out |
| `engrave` | **blue `#0000ff`** | optional over/under interlace hints (`2*B*(L-1)` polylines) |

**The blue lines must not be cut.** Give them a score or engrave operation, or
delete the layer. They run straight across the ribbon at every crossing, so cutting
them severs it and the rosette comes apart as it leaves the machine.

Give every colour you keep an explicit operation. A per-colour job **silently skips
any colour you leave unmapped**: leave `cut` unmapped and you get an engraved
picture of a sound hole and no hole.

## Read the validation report

| Line | Must be |
|---|---|
| closed contours vs flood regions | equal, else loops were lost |
| unclosed chains | `0`, else a contour leaked |
| crossings vs `B*(L-1)` | equal — printed and checked on every run |
| weave alternates | `OK`, else the engrave layer is suppressed |
| slivers welded shut | informational only — not a pass/fail, and not normally `0` |
| loose islands (CW) | `0` — else material falls out when cut |
| contour area vs flood area | delta ≤ ~0.1% |

`slivers welded shut` counts whole air regions narrower than `MIN_FEATURE` that
were filled back to material. **Its value is an artifact of where the sampling grid
falls**, not a property of the design: the trefoil reports 8 at `NG=700`, 6 at 1000,
4 at 1400 and 8 at 2000, while its contour count, open fraction and area hold
steady. The **region count** is the number that means something — it is stable
across resolutions, and when welding does eat a real lens it says so and keeps
saying so at any grid.

## How the over/under is decided

The retired two-lead generator could use a closed form — "over if `m` is even" —
because with two leads the single other pass sits exactly half the sample array away. With `L` leads a
point has `L-1` other passes, at offsets `k*M/L`, so that shortcut is gone.

Instead the crossing events are found numerically, ordered along the strand and
labelled alternately, and then **the pairing is verified**: each crossing must
receive one over and one under. It has held at every pair tested. If it ever fails,
the engrave layer is dropped and the report says so, rather than drawing a weave
that lies about itself.

Everything else — signed distance field, flood fill, sliver welding, marching
squares, chaining, RDP, SVG emit — is carried over unchanged, including the spatial
hash for distance.

## Run SELFTEST if you touch the distance code

The expanding-ring stopping bound fails **silently** if wrong — it just returns
distances that are too large, which reads as phantom extra "cut" area and quietly
changes the shape without any validation line firing.

```bash
LEADS=3 BIGHTS=5 SELFTEST=1 node celtic-knot-coprime-soundhole.js
```

The code's pass gate is `< 1e-9`, but the error should be **exactly `0`**: both
paths minimise the same expression over the same sample set, so they return
bit-identical floats. Any nonzero value at all means the ring search missed a sample
— do not read a small error as rounding. It is `0` at `(2,3)`, `(3,5)` and `(4,3)`.

## Traps already sprung here

- **The engrave seam, and why it is gone.** The retired two-lead generator had to
  offset its engrave scan, because crossings sat at odd multiples of `M/(4Q)` and
  starting exactly on one split its run, yielding `2Q+2` lines instead of `2Q`.
  This generator starts its scan at the sample **furthest from any other pass**, so
  no run can straddle the start. The hazard is designed out rather than offset
  around.
- **Chaining on rounded float coordinates.** Shared cell edges compute to slightly
  different values from each neighbouring cell, so loops fragment. Contours are
  keyed on integer grid-edge IDs instead.
- **Plain RDP on a closed loop.** `pts[0] == pts[last]` makes the baseline
  zero-length, every perpendicular distance zero, and the whole loop collapses to
  two points. See `rdpClosed`.
- The marching-squares table has a load-bearing invariant: segments are oriented
  **inside-on-left**. Chaining depends on it, and so does the loose-island check.

## Caveats

- Polylines only — no arc/bezier fitting, no kerf compensation, no DXF.
- `MIN_FEATURE` guards minimum **air** width, not material width.
- The envelope above is a tested range, not a proof. Nothing here says `(4,7)` or
  `(5,7)` fails, only that they have not been checked; run them and read the counts.
- Nothing here has been validated against real cut stock, and the narrowest cut
  falls fast as leads rise — 5.51mm at `2 × 3`, 0.66mm at `4 × 3`.

## Generated files

- `celtic-turk-3x4-soundhole-radius30mm.svg` — 3 leads × 4 bights
- `celtic-turk-3x5-soundhole-radius30mm.svg` — 3 leads × 5 bights

At two leads the shapes have folk names, and three of them ship — cut by the
generator this one replaced, and byte-identical to what it produces now:

| `LEADS` | `BIGHTS` | Knot | File |
|---|---|---|---|
| 2 | 3 | trefoil | `celtic-trefoil-soundhole-radius30mm.svg` |
| 2 | 5 | cinquefoil | `celtic-cinquefoil-soundhole-radius30mm.svg` |
| 2 | 7 | septafoil | `celtic-septafoil-soundhole-radius30mm.svg` |
| 2 | 9 | nonafoil | not committed |

The generator still uses those names in its report and in the SVG title when
`LEADS=2`.
