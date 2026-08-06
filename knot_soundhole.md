# Knot Sound Hole — any coprime leads × bights

Generator: `knot_soundhole.js`

Companion: [`plait_soundhole.md`](plait_soundhole.md) (two ribbons,
even crossings)

Replaces an earlier two-lead-only generator. Set `LEADS=2` and this reproduces its
output exactly — verified file by file, cut layer byte-identical and the same set of
engrave subpaths.

Produces a cut-ready SVG rosette for an instrument sound hole, sized in the terms a
knot-tyer already uses: **L leads by B bights**. The strand travels round `L` times
before it closes, and shows `B` scallops at the rim. Millimetre-true output,
`1 user unit = 1 mm`.

```
r(theta) = R_MID + AMP*cos(B*theta/L),   theta in [0, 2*pi*L)
```

It generalises the two-lead generator it replaced. That one had a single parameter,
`Q`, for its bight count, and required it to be odd — which is exactly `gcd(2, B) = 1`,
this rule at two leads.

## Leads and bights, and why they must be coprime

The strand closes into **one** piece iff `gcd(L, B) = 1`. That is not a convention,
it is what the curve does: `gcd(L, B)` counts the separate closed pieces you end up
with. Ask for 3 leads and 6 bights and you get three loops lying alongside each
other, with no single ribbon to trace and no interlace to alternate over. The
generator refuses, and lists the coprime bight counts near the leads you asked for.

The plait and the generator this replaced are both the `L = 2` row of one table:

| generator | leads | bights | `gcd` | strands |
|---|---|---|---|---|
| the retired knot generator | 2 | `Q`, odd | 1 | 1 — a knot |
| [plait](plait_soundhole.md) | 2 | `2N`, even | 2 | 2 — a plait |
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
node knot_soundhole.js                          # report only, writes nothing
LEADS=3 BIGHTS=5 OUT=3-lead_5-bight_knot_radius30mm.svg node knot_soundhole.js
LEADS=3 BIGHTS=4 OUT=3-lead_4-bight_knot_radius30mm.svg node knot_soundhole.js
LEADS=2 BIGHTS=3 node knot_soundhole.js         # 2 leads: the classic trefoil
SELFTEST=1 node knot_soundhole.js               # check the hash, exit
DIAG=1 node knot_soundhole.js                   # per-region dump
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

**A bigger panel alone does not fix that** — and this is the trap the rules of thumb
exist to prevent. The same `4 × 3` at `R_HOLE = 39` with default tuning gives 0.67mm,
essentially unchanged, because the ribbon did not grow with the panel and the weave
got relatively tighter. Scale `AMP` and `HW` with the radius and the same knot at the
same size gives **1.27mm**, near enough double. That is what the shipped
`4-lead_3-bight_knot_radius39mm.svg` uses.

| `R_HOLE` | `AMP` · `HW` | Narrowest | Open |
|---|---|---|---|
| 30 | 7.5 · 2.0 | 0.66mm | 39.4% |
| 39 | 7.5 · 2.0 | 0.67mm | 49.4% |
| **39** | **9.75 · 2.6** | **1.27mm** | **38.6%** |
| 39 | 11 · 1.8 | 1.64mm | 55.4% |

All four satisfy every invariant. The last is the most open and cuts widest, on a
3.6mm ribbon — thinner material spanning more air. The shipped file takes the middle,
as the sturdiest of them.

More leads means less open area, because more ribbon is packed into the same ring.

## Invariants — these pin the topology

```
crossings     == B*(L-1)
cut regions   == L*B + 1     (one centre + B*(L-1) lenses + B rim gaps)
rim anchors   == B
engrave lines == 2*B*(L-1)   (two edges of the over pass per crossing)
```

Two leads is the special case both older generators occupied: the retired one at
`(2, B)` with `B` odd gives `2B + 1` regions, and the plait at `(2, 2N)` gives
`4N + 1`. **The generator checks the crossing and
region counts on every run and prints whether they match.**

## The tested envelope, and where it stops

Verified against every invariant at `(2,3) (2,5) (2,9) (3,2) (3,4) (3,5) (4,3)`
and, on larger panels, `(5,4)` and `(9,11)`. `(2,3)` reproduced the retired two-lead
generator exactly — identical validation block, areas and sliver count, only the
report wording differs. That equivalence is the evidence the generalisation is
faithful rather than plausible.

**The limit is manufacturability, not topology**, and it is worth being precise about
what that means, because it is easy to mistake for a ceiling on leads. As leads rise,
two things shrink: the lens regions between passes, and the rim gaps between anchors.
Either falling under `MIN_FEATURE` gets it welded shut, and a welded region is one
the count never sees.

At a fixed 30mm panel that looks like a hard stop. `(5,2)` reports 2 crossings
against 8; `(7,2)` reports zero at default tuning; `(5,4)` caps at 17 regions
against 21. But the shortfall is almost always exactly `B` — the rim gaps — and
those scale with the panel:

- `(5,4)` is four regions short at 30mm and **exact at 60mm**.
- `(9,11)` is eleven short at 100mm and **exact at 300mm**.

So five leads and nine leads both work; they simply do not fit in a 30mm hole. What
the tested envelope really describes is a relationship between lead count and panel
size, not a maximum lead count.

Two things still need attention as leads rise:

- **The ribbon must thin**, roughly `AMP ≈ L × HW`, since `L` passes need room to
  separate. The `AMP ≈ 0.25*R_HOLE` rule of thumb above is for two or three leads and
  gets crowded beyond that.
- **Some pairs resist anyway.** `(4,5)` loses lenses rather than rim gaps, and size
  does not fix that as cleanly.

**Judge by the region and crossing counts, not by the sliver count** — see
[the validation report](#read-the-validation-report) for why.

### Size is the other lever, and it works

`(9,11)` satisfies every invariant — but only on a large enough panel, and that is
worth understanding because it is the clearest evidence for the claim above.

At the 30mm default it fails completely: 23 regions against 100, **zero** crossings
found, 18.3% open. Nine passes of 4mm ribbon do not fit that annulus at all. A finer
ribbon fixes the crossings — roughly `AMP ≈ 9 × HW`, giving nine passes room to
separate — and from 30mm up the crossing count is a correct 88.

The region count is what stays wrong, and it stays wrong by exactly **11**, which is
`B`. The eleven rim gaps were forming below `MIN_FEATURE` and being welded shut. They
scale with the panel, so at `R_HOLE = 300` they clear the floor and survive:

| `R_HOLE` | `AMP` | `HW` | regions (want 100) | crossings (want 88) | open |
|---|---|---|---|---|---|
| 30 | 7.5 | 2.0 | 23 | 0 | 18.3% |
| 30 | 7 | 0.3 | 78 | 88 | 79.1% |
| 100 | 26 | 1.0 | 89 | 88 | 76.3% |
| **300** | **78** | **5.0** | **100** | **88** | **61.1%** |

So the ceiling on leads is not a property of the curve. It is the cutting floor
meeting features that shrink as leads rise — and making the panel bigger moves those
features back above it. Note also that the region count was the only line telling the
truth at 100mm: crossings, engrave and anchors all read `OK` while eleven regions were
quietly missing.

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
LEADS=3 BIGHTS=5 SELFTEST=1 node knot_soundhole.js
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
- The envelope above is a tested range, not a proof. `(4,7)` has since been run and
  passes every invariant — 29 regions, 21 crossings, 42 engrave lines, 7 anchors —
  but see the warning below about what that does *not* tell you.
- Nothing here has been validated against real cut stock, and the narrowest cut
  falls fast as leads rise — 5.51mm at `2 × 3`, 0.66mm at `4 × 3`, **0.56mm at
  `4 × 7`**.

**Passing the invariants is not the same as being cuttable.** `(4,7)` satisfies both
counts and still comes out finer than `4 × 3`, which is flagged above as delicate.
The region and crossing counts tell you the *topology* survived; they say nothing
about whether a laser can make it. Read `tightest region inradius` from the report
as well — double it for the narrowest cut, and compare that against your kerf before
believing the OK lines.

## Generated files

- `3-lead_2-bight_knot_radius30mm.svg` — 3 leads × 2 bights
- `3-lead_4-bight_knot_radius30mm.svg` — 3 leads × 4 bights
- `3-lead_5-bight_knot_radius30mm.svg` — 3 leads × 5 bights
- `4-lead_3-bight_knot_radius39mm.svg` — 4 leads × 3 bights at `R_HOLE = 39`,
  `AMP=9.75 HW=2.6` — the only sample not at 30mm, and not at default tuning
- `5-lead_4-bight_knot_radius60mm.svg` — 5 leads × 4 bights at `R_HOLE = 60`,
  `AMP=15 HW=2.4` — a 120mm hole, and the smallest panel on which five leads resolve

- `2-lead_3-bight_knot_radius30mm.svg` — 2 leads × 3 bights
- `2-lead_5-bight_knot_radius30mm.svg` — 2 leads × 5 bights
- `2-lead_7-bight_knot_radius30mm.svg` — 2 leads × 7 bights

`3 × 2` has only **two rim anchors**, the fewest any of these designs can have. It
removes half the disc and holds the result on two 4mm tabs. Three anchors are
described above as a kinematic minimum rather than a stiffness one; two is below
that, so treat it as the most fragile thing here that still passes every invariant.

Two-lead knots also carry folk names, which you will meet in knot literature even
though the generator does not use them: **trefoil** at 3 bights, **cinquefoil** at
5, **septafoil** at 7, **nonafoil** at 9. Everything here is named by leads and
bights instead, in the report, in the SVG `<title>` and in the filename, so the
three always agree.

### One that is not a sound hole

- `9-lead_11-bight_knot_radius300mm.svg` — 9 leads × 11 bights, `AMP=78 HW=5.0`

**This is a 600 mm hole. Nothing has a sound hole that size** — it is a decorative
panel, a screen, a table inlay, and it is committed as a demonstration rather than as
something to fit an instrument. Read the caveats before cutting it:

- **Every invariant passes** — 100 regions, 88 crossings, 176 engrave lines, 11
  anchors, no loose islands — which is why it earns a place here. It is the only nine
  lead result that does.
- **It needs the size.** The same knot at `R_HOLE = 100` comes out eleven regions
  short, and at the 30 mm default it does not resolve at all. See
  [the envelope](#size-is-the-other-lever-and-it-works).
- **It is not at default settings.** `AMP=78 HW=5.0`, roughly the `AMP ≈ 9 × HW`
  ratio nine passes need. The shipped defaults produce nothing usable at nine leads.
- **61% of the disc is removed**, held by eleven 10 mm-wide anchors, across 600 mm.
  That is a large, open, fragile object and nothing here has been cut to find out how
  it behaves. Treat the span as the risk, not the cut width — the narrowest cut is a
  comfortable 2.90 mm.
- **148 slivers were welded.** With the region count correct those are grazing
  artifacts rather than lost structure, but fine detail has been rewritten in places.
