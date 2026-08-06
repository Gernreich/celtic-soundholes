# Celtic Knot Sound Hole — odd crossings (single self-crossing strand)

Generator: `celtic-knot-soundhole.js`
Companion (even crossings): [`celtic-plait-soundhole.md`](celtic-plait-soundhole.md)

Produces a cut-ready SVG of a trefoil / cinquefoil / septafoil rosette sized
for an instrument sound hole. Unlike the two-ribbon plait, this is **one
continuous ribbon** you can trace with a finger — it winds twice before
closing.

```
r(theta) = R_MID + AMP*cos(Q*theta/2),   theta in [0, 4*pi)
```

Closes into a single strand iff `gcd(2,Q) = 1`, i.e. **Q odd**, and then has
exactly `Q` self-crossings. Millimetre-true output, `1 user unit = 1 mm`.

| `Q` | Knot |
|---|---|
| 3 | trefoil |
| 5 | cinquefoil |
| 7 | septafoil |
| 9 | nonafoil |
| 11+ | any odd integer works |

## Why odd crossings need a different curve

Alternating over/under has to close up when you return to your start.

In the two-ribbon plait each strand meets every crossing **once**, so the
crossing count must be even — that generator can never produce an odd number,
for any parameters.

A self-crossing strand visits every crossing **twice**, so it always sees an
even number of crossing *events* no matter how many crossings exist. That is
why a 3-crossing trefoil is a perfectly valid alternating knot.

Concretely: crossing events sit at `t = pi*(2m+1)/Q` for `m = 0..2Q-1`, and the
two visits to one crossing are `m` and `m+Q`. Assigning "over if `m` is even"
gives them opposite parity **exactly when `Q` is odd**. Even `Q` is refused
with an error pointing at the companion generator — with `Q` even the curve
closes after *one* turn into a single loop with **no** self-crossings, and
sampling two turns just retraces it, so there is no interlace to alternate.

## The structural constraint

Same as the companion. This is a cut-out, so the ribbon peaks overrun the rim
by `BITE` mm and fuse the rosette into the soundboard — here at an **odd**
number of anchor points (`Q`). There is no continuous rim circle in the cut
layer; the outer boundary is `Q` arcs. Correct, not a bug.

## Usage

```bash
node celtic-knot-soundhole.js                                   # report only
OUT=trefoil-radius30mm.svg node celtic-knot-soundhole.js        # Q=3 default
Q=5 OUT=cinquefoil-radius30mm.svg node celtic-knot-soundhole.js
Q=7 OUT=septafoil-radius30mm.svg node celtic-knot-soundhole.js
SELFTEST=1 node celtic-knot-soundhole.js                        # check the hash, exit
DIAG=1 node celtic-knot-soundhole.js                            # per-region dump
```

| Var | Default | Meaning |
|---|---|---|
| `R_HOLE` | `30` | sound hole radius, mm |
| `Q` | `3` | crossings — **odd integer ≥ 3**; also the rim anchor count |
| `AMP` | `7.5` | radial swing of the weave |
| `HW` | `2.0` | ribbon half-width → ribbon is `2*HW` mm wide |
| `BITE` | `1.5` | rim overrun; this is what anchors the rosette |
| `NG` | `1400` | sampling grid resolution |
| `MIN_FEATURE` | `0.25` | gaps narrower than this are welded to solid material |
| `OUT` | unset | output path — **nothing is written unless set** |
| `SELFTEST` | unset | verify spatial hash against brute force, then exit |
| `DIAG` | unset | verbose per-region report |

`AMP` defaults to **7.5 here vs 6.5 in the companion** — deliberate, not
drift. These knots are far sparser than a plait and want a wider radial swing
to fill the ring. Neither `AMP` nor `HW` auto-scales with `R_HOLE`; roughly
`AMP ≈ 0.25*R_HOLE`, `HW ≈ 0.067*R_HOLE`.

### The centre opening is derived, and it can abort the run

```
R_CENTRE = R_HOLE + BITE - 2*(AMP + HW)
```

The generator **exits 1** if that drops below 1mm. So shrinking `R_HOLE` while
leaving `AMP`/`HW` at their defaults does not give you a tighter knot, it
refuses to run — at defaults it aborts below `R_HOLE ≈ 18.5`. Scale both with
the rules of thumb above and `R_CENTRE ≈ 0.37*R_HOLE` regardless of size.

### Sampling and the error floor

The centreline is sampled at a fixed `M = 20000` points — not exposed as a
variable — and distance is measured to those samples, so it **overestimates**
by up to half the sample spacing. That spacing is `Q`-dependent, because arc
length grows with the `AMP*Q/2` radial derivative: roughly 0.015mm at `Q=3` and
0.023mm at `Q=11`, i.e. worst-case error ~0.011mm. Still an order of magnitude
under the 0.25mm `MIN_FEATURE` floor, but with about half the margin at the top
of the tested `Q` range as at the bottom.

## Variants at R_HOLE=30 (60mm hole)

| `Q` | Knot | Regions | Open area | Equiv. plain hole | Narrowest cut | Anchors |
|---|---|---|---|---|---|---|
| **3** | **trefoil** | **7** | **63.3%** | **47.73mm** | **5.51mm** | **3** |
| 5 | cinquefoil | 11 | 60.2% | 46.54mm | 4.92mm | 5 |
| 7 | septafoil | 15 | 56.3% | 45.00mm | 4.30mm | 7 |
| 9 | nonafoil | 19 | 52.0% | 43.25mm | 3.75mm | 9 |

`Q=9` is what the generator reports, but no nonafoil SVG is committed — the
files listed at the bottom are `Q` = 3, 5, 7 only.

These are all **more open** than the equivalent plait — the trefoil removes
63% of the disc vs 52% for the 10-crossing plait, with only 3 anchor points.
That comparison is at each generator's *own defaults*, so part of the gap is
`AMP` 7.5 vs 6.5, not topology; at equal `AMP` the two move closer together.

Three anchors are enough to fix the rosette's plane, but that is a kinematic
statement, not a stiffness one — it says nothing about how a 63%-open disc
behaves under string load and soundboard vibration. Read the trefoil as the
variant that most needs bracing thought, not the one that got away with fewer
anchors.

## Invariants — cheap to check, and they pin the topology

```
cut regions   == 2Q + 1     (one centre + Q lens + Q rim openings)
engrave lines == 2Q         (Q crossings, 2 edges of the over pass each)
rim anchors   == Q          (odd — the whole point of this generator)
```

Verified at Q = 3, 5, 7, 9, 11. **If a change breaks these, the topology moved
even if the picture still looks plausible.**

The region count is derivable, not merely observed. Crossings need
`cos(Q*theta/2) = 0`, so **every crossing sits at exactly `r = R_MID`** — they
all lie on one circle. Euler on the knot diagram (`Q` 4-valent vertices, `2Q`
edges) gives `Q+1` bounded faces: the centre disc inside that circle, plus `Q`
lenses on it. The `Q` rim gaps outside make `2Q+1`. The same fact means the
engrave rim guard (`|p| < R_HOLE - 0.05`) is purely defensive and can never
fire — with defaults the crossings are at `r = 22`, nowhere near `R_HOLE = 30`.

The `2Q` engrave count is the fragile invariant: runs shorter than 5 samples
are discarded outright, so at large `Q` or small `HW` lines start vanishing
silently. That filter, not the parity argument, is what sets the tested ceiling.

## Output layers

| Group | Purpose |
|---|---|
| `preview` | material fill, even-odd. **Delete before sending to a cutter.** |
| `cut` | every closed path is waste that drops out |
| `engrave` | optional over/under interlace hints (`2Q` polylines) |

## What differs from the companion internally

The companion's distance function exploits the polar-graph property — one
radius per angle — and searches centreline samples in a window around the
query point's own theta. **This curve has two radii per angle, so that
shortcut is invalid.** Distance here goes through a uniform spatial hash with
an expanding-ring search and an exact stopping bound.

Everything downstream (field → flood fill → marching squares → chain → RDP →
SVG) is topology-agnostic and carried over unchanged.

## Run SELFTEST if you touch the distance code

The expanding-ring stopping bound fails **silently** if wrong — it just
returns distances that are too large, which reads as phantom extra "cut" area
and quietly changes the shape without any validation line firing.

```bash
Q=3 SELFTEST=1 node celtic-knot-soundhole.js
# SELFTEST spatial hash vs brute force: 4000 points, max error 0.000e+0mm OK
```

The code's pass gate is `< 1e-9`, but the error should be **exactly `0`**: both
paths minimise the same expression over the same sample set, so they return
bit-identical floats. Any nonzero value at all means the ring search missed a
sample — do not read a small error as rounding. It is `0` at Q = 3, 5, 7, 9.

## Read the validation report

| Line | Must be |
|---|---|
| closed contours vs flood regions | equal, else loops were lost |
| unclosed chains | `0`, else a contour leaked |
| slivers welded shut | normally `0`; nonzero means `MIN_FEATURE` rewrote the field and the shape you get is not the shape the curve describes |
| loose islands (CW) | `0` — else material falls out when cut |
| contour area vs flood area | delta ≤ ~0.1% |

## Traps already sprung here

- **Engrave seam.** Crossings sit at **odd multiples of `M/(4Q)`**, so starting
  the engrave scan at `M/(4Q)` begins exactly *on* a crossing and splits its
  run — yielding `2Q+2` lines instead of `2Q`. Be clear about where the safety
  actually comes from: index `0` is already a safe midpoint (an even multiple),
  and the `round(M/(2Q))` offset in the code shifts by exactly one crossing
  spacing, so it is a **no-op for correctness**. The rule is *never offset by an
  odd multiple of `M/(4Q)`* — deleting the present offset is harmless, changing
  it to `M/(4Q)` is not.
- Inherited from the shared code: chaining must key on integer grid-edge IDs,
  not rounded floats; and `rdpClosed` exists because plain RDP collapses a
  closed loop to two points.

## Caveats

- Polylines only — no arc/bezier fitting, no kerf compensation, no DXF.
- `MIN_FEATURE` guards minimum **air** width, not material width.
- Very open designs; the trefoil especially. Consider soundboard bracing.
- Ribbon width has not been validated against actual cut stock.

## Generated files

- `celtic-trefoil-soundhole-radius30mm.svg` (Q=3)
- `celtic-cinquefoil-soundhole-radius30mm.svg` (Q=5)
- `celtic-septafoil-soundhole-radius30mm.svg` (Q=7)
