'use strict';
//
// Celtic torus-knot sound hole -> cut-ready SVG   (ODD crossing counts)
// =====================================================================
//
// Companion to celtic-knot-soundhole.js. That one weaves TWO ribbons and can
// only ever produce an EVEN number of crossings (2N): both ribbons are polar
// graphs r(theta), a plane point has a unique (r,theta), so they meet exactly
// where rA = rB, and that difference is 2*AMP*sin(N*theta) -- 2N zeros a turn.
//
// This one makes ODD crossing counts using a SINGLE self-crossing strand:
//
//     r(theta) = R_MID + AMP*cos(Q*theta/2),   theta in [0, 4*pi)
//
// It winds twice before closing (closes iff gcd(2,Q)=1, i.e. Q odd) and has
// exactly Q self-crossings. Q=3 trefoil, Q=5 cinquefoil, Q=7 septafoil, ...
//
// WHY A SINGLE STRAND ESCAPES THE PARITY TRAP
//   Alternating over/under has to close up when you return to your start. In
//   the two-ribbon design each strand meets every crossing exactly once, so
//   the crossing count must be even. A self-crossing strand visits every
//   crossing TWICE, so it always sees an even number of crossing events no
//   matter how many crossings exist -- which is why a 3-crossing trefoil is a
//   perfectly good alternating knot.
//
//   Concretely: crossing events sit at t = pi*(2m+1)/Q for m = 0..2Q-1, and
//   the two visits to one crossing are m and m+Q. Assigning "over if m is
//   even" gives them opposite parity exactly when Q is ODD. That is the whole
//   reason this construction needs odd Q, and it is asserted below.
//
// THE STRUCTURAL CONSTRAINT (same as the sibling generator)
//   This is a cut-out: removed material is the open area, the ribbon stays.
//   A ribbon floating in a round hole would drop out, so the ribbon peaks
//   overrun the rim by BITE mm, fusing the rosette into the soundboard at Q
//   anchor points (an ODD number of anchors here). So there is no continuous
//   rim circle in the cut layer -- the outer boundary is Q arcs. Correct.
//
// WHAT CHANGED vs THE SIBLING, AND WHY
//   The sibling's distance function exploits the polar-graph property: one
//   radius per angle, so it searches centreline samples in a window around the
//   query point's own theta. This curve has TWO radii per angle, so that
//   shortcut is invalid. Distance here goes through a uniform spatial hash
//   with an expanding-ring search and an exact stopping bound. Everything
//   downstream (field -> flood fill -> marching squares -> chain -> RDP) is
//   topology-agnostic and is carried over unchanged.
//
// USAGE   (nothing is written unless OUT is set)
//   node celtic-torus-soundhole.js                  report only
//   OUT=trefoil.svg node celtic-torus-soundhole.js  Q=3 default
//   Q=5 OUT=cinquefoil.svg node celtic-torus-soundhole.js
//   Q=7 OUT=septafoil.svg  node celtic-torus-soundhole.js
//   SELFTEST=1 node celtic-torus-soundhole.js       check the hash, exit
//   DIAG=1 node celtic-torus-soundhole.js           per-region dump
//
//   Q must be an odd integer >= 3. Even Q does not close into one strand.
//   R_HOLE AMP HW BITE NG MIN_FEATURE OUT DIAG SELFTEST
//
//   NOTE the AMP default here is 7.5, vs 6.5 in the sibling. That is
//   deliberate, not drift: these knots are much sparser than a plait and want
//   a wider radial swing to fill the ring. AMP and HW do NOT auto-scale with
//   R_HOLE; roughly AMP ~ 0.25*R_HOLE, HW ~ 0.067*R_HOLE.
//
// OUTPUT LAYERS   preview (delete before cutting) / cut / engrave
//
// RUN SELFTEST IF YOU TOUCH THE DISTANCE CODE
//   The expanding-ring search in distCurve has an exact stopping bound. If
//   that bound is wrong it fails SILENTLY -- it just returns distances that
//   are too large, which reads as phantom extra "cut" area and quietly
//   changes the shape. SELFTEST=1 compares 4000 random points against brute
//   force and should report max error exactly 0.
//
// INVARIANTS -- cheap to check, and they pin the topology
//   cut regions    == 2Q + 1   (one centre + Q lens + Q rim openings)
//   engrave lines  == 2Q       (Q crossings, 2 edges of the over pass each)
//   rim anchors    == Q        (odd -- the whole point of this generator)
//   Verified at Q = 3, 5, 7, 9, 11. If a change breaks these, the topology
//   moved even if the picture still looks plausible.
//
// THE VALIDATION REPORT -- read it
//   closed contours vs flood regions  must match, else loops were lost
//   unclosed chains                   must be 0, else a contour leaked
//   loose islands (CW)                must be 0, else material falls out
//   contour area vs flood area        two independent measurements; >~0.1%
//                                     means the polygons and the field they
//                                     came from are not the same shape
//
// A TRAP ALREADY SPRUNG HERE
//   Crossings sit at ODD multiples of M/(4Q). The engrave scan therefore must
//   not start at M/(4Q) -- that is exactly ON a crossing and splits its run,
//   yielding 2Q+2 lines instead of 2Q. See the comment at the scan start.
//
const fs = require('fs');

// ---------------------------------------------------------------- params
const num = (k, d) => process.env[k] ? Number(process.env[k]) : d;
const R_HOLE = num('R_HOLE', 30);   // sound-hole radius (mm)
const Q      = num('Q', 3);         // crossings; odd. 3=trefoil 5=cinquefoil
const AMP    = num('AMP', 7.5);     // radial swing of the weave
const HW     = num('HW', 2.0);      // ribbon half-width -> 4 mm ribbon
const BITE   = num('BITE', 1.5);    // how far ribbon peak overruns the rim
const NG     = num('NG', 1400);
const MIN_FEATURE = num('MIN_FEATURE', 0.25);

if (!Number.isInteger(Q) || Q < 3 || Q % 2 === 0) {
  console.error(`Q must be an odd integer >= 3 (got ${Q}).\n` +
    `  Even Q makes gcd(2,Q)=2, so r = R_MID + AMP*cos(Q*theta/2) closes after\n` +
    `  ONE turn into a single loop with NO self-crossings -- sampling two turns\n` +
    `  just retraces it -- so there is no interlace for over/under to alternate\n` +
    `  over. For even crossing counts use the two-ribbon generator\n` +
    `  celtic-knot-soundhole.js instead.`);
  process.exit(1);
}

// anchor the ribbon INTO the soundboard: peak outer edge = R_HOLE + BITE
const R_MID    = R_HOLE + BITE - AMP - HW;
const R_CENTRE = R_MID - AMP - HW;
if (R_CENTRE < 1) {
  console.error(
    `Geometry does not close: centre opening would be ${R_CENTRE.toFixed(2)}mm.\n` +
    `  R_HOLE=${R_HOLE} BITE=${BITE} AMP=${AMP} HW=${HW} -> R_MID=${R_MID.toFixed(2)}\n` +
    `  Try AMP=${(R_HOLE * 0.25).toFixed(1)} HW=${(R_HOLE * 0.067).toFixed(1)}.`);
  process.exit(1);
}

// ------------------------------------------- centreline: ONE strand, 2 turns
// M must be EVEN so that i + M/2 is exactly the same theta one turn later,
// which is how the "other pass" at a crossing is located. Distance is measured
// to these SAMPLES, not to the true curve, so it overestimates by up to half
// the sample spacing. That spacing grows with Q (arc length carries the
// AMP*Q/2 radial derivative): at M=20000 over ~2 turns it is ~0.015mm at Q=3
// and ~0.023mm at Q=11, so worst-case error ~0.011mm -- still an order of
// magnitude below the 0.25mm manufacturability floor, but with roughly half
// the margin at the top of the tested Q range as at the bottom.
const M = 20000;
const cx = new Float64Array(M), cy = new Float64Array(M);
for (let i = 0; i < M; i++) {
  const t = 4 * Math.PI * i / M;
  const r = R_MID + AMP * Math.cos(Q * t / 2);
  cx[i] = r * Math.cos(t);
  cy[i] = r * Math.sin(t);
}

// --------------------------------------------------- spatial hash for dist
// Two radii per angle here, so no angular-window shortcut. Bucket the
// centreline samples into a uniform grid and do an expanding-ring search.
const EXT  = R_HOLE + 2;
// CELL trades bucket count against points-per-bucket. Correctness does not
// depend on it -- the ring search is exact for any positive CELL -- only speed
// does. ~1.5mm keeps buckets to a handful of samples while the typical query
// still terminates within a ring or two.
const CELL = 1.5;
const NCX  = Math.ceil((2 * EXT) / CELL);
const cellOf = v => Math.max(0, Math.min(NCX - 1, Math.floor((v + EXT) / CELL)));
const buckets = new Array(NCX * NCX);
for (let i = 0; i < M; i++) {
  const k = cellOf(cy[i]) * NCX + cellOf(cx[i]);
  (buckets[k] || (buckets[k] = [])).push(i);
}

function distCurve(x, y) {
  const ci = cellOf(x), cj = cellOf(y);
  let best = Infinity;                              // squared
  for (let ring = 0; ring < NCX; ring++) {
    for (let dj = -ring; dj <= ring; dj++) {
      const b = cj + dj;
      if (b < 0 || b >= NCX) continue;
      const edge = (Math.abs(dj) === ring);
      for (let di = -ring; di <= ring; di++) {
        // only the shell at Chebyshev distance == ring
        if (!edge && Math.abs(di) !== ring) continue;
        const a = ci + di;
        if (a < 0 || a >= NCX) continue;
        const arr = buckets[b * NCX + a];
        if (!arr) continue;
        for (let n = 0; n < arr.length; n++) {
          const i = arr[n], dx = x - cx[i], dy = y - cy[i];
          const s = dx * dx + dy * dy;
          if (s < best) best = s;
        }
      }
    }
    // A point in an unvisited cell (Chebyshev ring >= ring+1) is at least
    // ring*CELL away, so once best beats that no further ring can improve it.
    const bound = ring * CELL;
    if (best <= bound * bound) break;
  }
  return Math.sqrt(best);
}

// SELFTEST=1 checks the hash against brute force. The expanding-ring stopping
// bound is the one thing here that fails SILENTLY if it is wrong -- it would
// just return distances that are too large, i.e. phantom extra "cut" area.
if (process.env.SELFTEST) {
  const brute = (x, y) => {
    let b = Infinity;
    for (let i = 0; i < M; i++) {
      const dx = x - cx[i], dy = y - cy[i];
      const s = dx * dx + dy * dy;
      if (s < b) b = s;
    }
    return Math.sqrt(b);
  };
  let worst = 0, n = 0;
  for (let k = 0; k < 4000; k++) {
    const x = (Math.random() * 2 - 1) * EXT, y = (Math.random() * 2 - 1) * EXT;
    const e = Math.abs(distCurve(x, y) - brute(x, y));
    if (e > worst) worst = e;
    n++;
  }
  console.log(`SELFTEST spatial hash vs brute force: ${n} points, ` +
              `max error ${worst.toExponential(3)}mm ` +
              `${worst < 1e-9 ? 'OK' : '*** HASH IS WRONG ***'}`);
  process.exit(worst < 1e-9 ? 0 : 1);
}

// signed field: >0 = cut away (air), <0 = material
function field(x, y) {
  return Math.min(R_HOLE - Math.hypot(x, y), distCurve(x, y) - HW);
}

// ------------------------------------------------------------- sample
const step = (2 * EXT) / NG;
const gx = i => -EXT + i * step;
const F = new Float64Array((NG + 1) * (NG + 1));
const at = (i, j) => F[j * (NG + 1) + i];
for (let j = 0; j <= NG; j++)
  for (let i = 0; i <= NG; i++)
    F[j * (NG + 1) + i] = field(gx(i), gx(j));

// ------------------------------ region analysis + manufacturability filter
// Flood fill FIRST so sub-cutter-width slivers can be welded shut before
// contouring; otherwise they emit unmanufacturable micro-loops.
function floodRegions() {
  const lab = new Int32Array((NG + 1) * (NG + 1)).fill(-1);
  const regs = [];
  for (let j0 = 0; j0 <= NG; j0++) for (let i0 = 0; i0 <= NG; i0++) {
    const id0 = j0 * (NG + 1) + i0;
    if (F[id0] <= 0 || lab[id0] !== -1) continue;
    const rid = regs.length, st = [id0], cells = [];
    lab[id0] = rid;
    let mx = 0;
    while (st.length) {
      const id = st.pop(), i = id % (NG + 1), j = (id - i) / (NG + 1);
      cells.push(id);
      if (F[id] > mx) mx = F[id];
      const nb = [[i - 1, j], [i + 1, j], [i, j - 1], [i, j + 1]];
      for (const [a, b] of nb) {
        if (a < 0 || b < 0 || a > NG || b > NG) continue;
        const q = b * (NG + 1) + a;
        if (F[q] > 0 && lab[q] === -1) { lab[q] = rid; st.push(q); }
      }
    }
    regs.push({ inr: mx, cells });
  }
  return { lab, regs };
}
let { regs } = floodRegions();
let welded = 0;
for (const r of regs) {
  if (r.inr >= MIN_FEATURE) continue;
  for (const id of r.cells) F[id] = -1e-9;
  welded++;
}
const after = floodRegions();
const lab = after.lab;
const nreg = after.regs.length;
const inrad = after.regs.map(r => r.inr);
let cutCells = 0;
for (let k = 0; k < F.length; k++) if (F[k] > 0) cutCells++;
const floodArea = cutCells * step * step;

// --------------------------------------------------- marching squares
// corners bl,br,tr,tl = bits 1,2,4,8 ; edges 0=bottom 1=right 2=top 3=left
//
// INVARIANT: every segment is emitted [from, to] oriented so the INSIDE
// (F > 0, air) lies on its LEFT. Chaining matches one segment's end to the
// next one's start, so a reversed entry dead-ends the walk; and consistent
// orientation is what makes every cut contour counter-clockwise, which is how
// a clockwise contour is detected as a loose island that would fall out.
const TABLE = {
  1: [[0, 3]], 2: [[1, 0]], 4: [[2, 1]], 8: [[3, 2]],
  3: [[1, 3]], 6: [[2, 0]], 12: [[3, 1]], 9: [[0, 2]],
  7: [[2, 3]], 14: [[3, 0]], 13: [[0, 1]], 11: [[1, 2]],
};
// Every contour vertex lies on a grid edge. Identify it by an integer edge id
// and compute its point ONCE from the canonical corner order, so both cells
// sharing an edge get a bit-identical vertex and chaining is exact. (Keying
// on rounded float coordinates silently fragments loops.)
const NH = (NG + 1) * (NG + 1);
const hId = (i, j) => j * (NG + 1) + i;
const vId = (i, j) => NH + j * (NG + 1) + i;
const ptCache = new Map();
function edgePoint(id) {
  let p = ptCache.get(id);
  if (p) return p;
  if (id < NH) {
    const i = id % (NG + 1), j = (id - i) / (NG + 1);
    const a = at(i, j), b = at(i + 1, j);
    p = [gx(i) + step * (a / (a - b)), gx(j)];
  } else {
    const r = id - NH, i = r % (NG + 1), j = (r - i) / (NG + 1);
    const a = at(i, j), b = at(i, j + 1);
    p = [gx(i), gx(j) + step * (a / (a - b))];
  }
  ptCache.set(id, p);
  return p;
}
const gid = (e, i, j) => e === 0 ? hId(i, j) : e === 1 ? vId(i + 1, j)
                       : e === 2 ? hId(i, j + 1) : vId(i, j);

const segs = [];
for (let j = 0; j < NG; j++) for (let i = 0; i < NG; i++) {
  const f = [at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j + 1)];
  let c = 0;
  if (f[0] > 0) c |= 1; if (f[1] > 0) c |= 2;
  if (f[2] > 0) c |= 4; if (f[3] > 0) c |= 8;
  if (c === 0 || c === 15) continue;
  let list;
  if (c === 5 || c === 10) {
    const ctr = (f[0] + f[1] + f[2] + f[3]) / 4 > 0;
    if (c === 5)  list = ctr ? [[0, 1], [2, 3]] : [[0, 3], [2, 1]];
    else          list = ctr ? [[3, 0], [1, 2]] : [[1, 0], [3, 2]];
  } else list = TABLE[c];
  for (const [a, b] of list) segs.push([gid(a, i, j), gid(b, i, j)]);
}

// ------------------------------------------------------ chain segments
const byStart = new Map();
segs.forEach((s, k) => {
  if (!byStart.has(s[0])) byStart.set(s[0], []);
  byStart.get(s[0]).push(k);
});
const used = new Uint8Array(segs.length);
const loops = [];
let openChains = 0;
for (let s = 0; s < segs.length; s++) {
  if (used[s]) continue;
  const start = segs[s][0];
  const ids = [start];
  let cur = s, closed = false;
  for (;;) {
    used[cur] = 1;
    const end = segs[cur][1];
    if (end === start) { closed = true; break; }
    ids.push(end);
    const cand = byStart.get(end);
    if (!cand) break;
    const nxt = cand.find(k => !used[k]);
    if (nxt === undefined) break;
    cur = nxt;
  }
  if (!closed) { openChains++; continue; }
  if (ids.length >= 3) loops.push(ids.map(edgePoint).concat([edgePoint(start)]));
}

// ------------------------------------------------------------- RDP
function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  let idx = 0, dmax = 0;
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  const L = Math.hypot(bx - ax, by - ay) || 1;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs((bx - ax) * (ay - pts[i][1]) - (ax - pts[i][0]) * (by - ay)) / L;
    if (d > dmax) { dmax = d; idx = i; }
  }
  if (dmax > eps) {
    const l = rdp(pts.slice(0, idx + 1), eps), r = rdp(pts.slice(idx), eps);
    return l.slice(0, -1).concat(r);
  }
  return [pts[0], pts[pts.length - 1]];
}
// RDP on a CLOSED loop must not use pts[0]..pts[last] as its baseline: they
// are the same point, every perpendicular distance is 0, and the loop
// collapses to two points. Split at the antipode and simplify each half.
function rdpClosed(pts, eps) {
  const n = pts.length - 1;
  if (n < 4) return pts;
  const k = n >> 1;
  const a = rdp(pts.slice(0, k + 1), eps);
  const b = rdp(pts.slice(k), eps);
  return a.slice(0, -1).concat(b);
}
const simp = loops.map(l => rdpClosed(l, 0.015));

// ------------------------------------------------------------- areas
const shoe = p => {
  let a = 0;
  for (let i = 0; i < p.length - 1; i++)
    a += p[i][0] * p[i + 1][1] - p[i + 1][0] * p[i][1];
  return a / 2;
};
const openArea = simp.reduce((s, p) => s + Math.abs(shoe(p)), 0);

// ------------------------------------------- interlace engrave lines
// Crossing events sit at t = pi*(2m+1)/Q, m = 0..2Q-1, and the two visits to
// one crossing are m and m+Q -- opposite parity exactly because Q is odd. So
// "over if m is even" is a consistent alternating assignment. At a crossing we
// engrave the OVER pass's two edges across the under pass's body.
const HALF = M / 2;                       // exactly one turn in samples
const WIN  = Math.ceil(M / (2 * Q));      // one crossing spacing, in samples
function distOtherPass(x, y, i) {
  let best = Infinity;
  for (let d = -WIN; d <= WIN; d++) {
    let k = (i + HALF + d) % M; if (k < 0) k += M;
    const dx = x - cx[k], dy = y - cy[k];
    const s = dx * dx + dy * dy;
    if (s < best) best = s;
  }
  return Math.sqrt(best);
}
const mOf = i => {
  const t = 4 * Math.PI * i / M;
  let m = Math.round((t * Q / Math.PI - 1) / 2) % (2 * Q);
  return m < 0 ? m + 2 * Q : m;
};
const engrave = [];
for (const sign of [1, -1]) {
  let run = [];
  for (let s0 = 0; s0 < M; s0++) {
    // Crossings sit at ODD multiples of M/(4Q), so starting the scan at
    // M/(4Q) would begin exactly ON one and split its run in two. M/(2Q) is
    // the midpoint between adjacent crossings, which is what we want.
    const i = (s0 + Math.round(M / (2 * Q))) % M;
    const a = (i - 1 + M) % M, b = (i + 1) % M;
    let tx = cx[b] - cx[a], ty = cy[b] - cy[a];
    const L = Math.hypot(tx, ty); tx /= L; ty /= L;
    const px = cx[i] + sign * HW * -ty, py = cy[i] + sign * HW * tx;
    const over = (mOf(i) % 2 === 0);
    const keep = over && distOtherPass(px, py, i) < HW &&
                 Math.hypot(px, py) < R_HOLE - 0.05;
    if (keep) run.push([px, py]);
    else { if (run.length > 4) engrave.push(rdp(run, 0.01)); run = []; }
  }
  if (run.length > 4) engrave.push(rdp(run, 0.01));
}

// ------------------------------------------------------------- output
const f2 = n => (Math.round(n * 1000) / 1000).toString();
const dOf = p => 'M' + p.map(q => f2(q[0]) + ' ' + f2(q[1])).join('L') + 'Z';
const dOpen = p => 'M' + p.map(q => f2(q[0]) + ' ' + f2(q[1])).join('L');
const cutD = simp.map(dOf).join('');
const engD = engrave.map(dOpen).join('');

const NAME = { 3: 'trefoil', 5: 'cinquefoil', 7: 'septafoil', 9: 'nonafoil' }[Q]
           || `${Q}-crossing knot`;
const OUT  = process.env.OUT;
const PAD  = 0.5;
const SIZE = f2(2 * (R_HOLE + PAD));
const ORG  = f2(-(R_HOLE + PAD));
const R    = f2(R_HOLE);
const rimCircle = `M${R} 0A${R} ${R} 0 1 0 -${R} 0A${R} ${R} 0 1 0 ${R} 0Z`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg"
     width="${SIZE}mm" height="${SIZE}mm" viewBox="${ORG} ${ORG} ${SIZE} ${SIZE}">
  <title>Celtic ${NAME} sound hole - ${R_HOLE} mm radius</title>
  <!-- 1 user unit = 1 mm, so this prints/cuts at true size.
       Sound hole radius ${R_HOLE}mm (${2 * R_HOLE}mm diameter).
       ${NAME}: ONE self-crossing ribbon ${2 * HW}mm wide, ${Q} crossings.
       Single strand r = ${R_MID.toFixed(2)} + ${AMP}*cos(${Q}*theta/2), theta in [0,4pi),
       winding twice before it closes.
       The ribbon overruns the rim by ${BITE}mm at ${Q} points, fusing it
       into the soundboard, so the rosette cannot drop out when cut.
       Open area ${openArea.toFixed(0)}mm2 = ${(100 * openArea / (Math.PI * R_HOLE * R_HOLE)).toFixed(0)}% of a plain ${2 * R_HOLE}mm hole
       (acoustically equivalent to a plain round hole of
       ${(2 * Math.sqrt(openArea / Math.PI)).toFixed(1)}mm diameter).
       Narrowest cut region: ${(2 * Math.min(...inrad)).toFixed(2)}mm across. -->

  <!-- PREVIEW ONLY - delete this group before sending to the cutter -->
  <g id="preview">
    <path fill="#d8c9a8" fill-rule="evenodd"
          d="${rimCircle}${cutD}"/>
  </g>

  <!-- CUT: every closed path here is waste that drops out -->
  <g id="cut" fill="none" stroke="#ff0000" stroke-width="0.1">
    <path d="${cutD}"/>
  </g>

  <!-- ENGRAVE (optional): over/under interlace hints -->
  <g id="engrave" fill="none" stroke="#0000ff" stroke-width="0.1"
     stroke-linecap="round">
    <path d="${engD}"/>
  </g>
</svg>
`;
if (OUT) fs.writeFileSync(OUT, svg);

// ------------------------------------------------------------- report
const discArea = Math.PI * R_HOLE * R_HOLE;
const signed = simp.map(shoe);
console.log('-- validation --');
console.log('closed contours     :', simp.length, ' flood regions:', nreg,
            simp.length === nreg ? 'OK' : '*** MISMATCH ***');
console.log('unclosed chains     :', openChains, openChains === 0 ? 'OK' : '*** LEAK ***');
console.log('slivers welded shut :', welded,
            '(< ' + MIN_FEATURE + 'mm, unmanufacturable)');
console.log('loose islands (CW)  :', signed.filter(a => a < 0).length,
            signed.every(a => a > 0) ? 'OK - nothing falls out' : '*** ISLAND ***');
console.log('contour area        :', openArea.toFixed(2),
            ' flood area:', floodArea.toFixed(2),
            ' delta:', (100 * Math.abs(openArea - floodArea) / floodArea).toFixed(2) + '%');
console.log('-- geometry --');
console.log('knot                :', NAME, ' Q =', Q, '(odd)  crossings =', Q);
console.log('Q,AMP,HW,R_MID      :', Q, AMP, HW, R_MID.toFixed(2));
console.log('centre opening (mm) :', R_CENTRE.toFixed(2));
console.log('tightest region inradius (mm):', Math.min(...inrad).toFixed(3));
console.log('largest  region inradius (mm):', Math.max(...inrad).toFixed(3));
console.log('open area (mm^2)    :', openArea.toFixed(2));
console.log('plain hole area     :', discArea.toFixed(2));
console.log('open fraction       :', (openArea / discArea * 100).toFixed(1) + '%');
console.log('equiv. round hole dia (mm):', (2 * Math.sqrt(openArea / Math.PI)).toFixed(2));
console.log('engrave polylines   :', engrave.length);
console.log('ribbon width (mm)   :', 2 * HW);
console.log('rim anchors         :', Q, '(odd)');
console.log('cut path bytes      :', cutD.length);

if (process.env.DIAG) {
  const info = [];
  for (let j = 0; j <= NG; j++) for (let i = 0; i <= NG; i++) {
    const id = j * (NG + 1) + i, L = lab[id];
    if (L < 0) continue;
    if (!info[L]) info[L] = { n: 0, mx: 0, sx: 0, sy: 0 };
    const o = info[L]; o.n++; o.sx += gx(i); o.sy += gx(j);
    if (F[id] > o.mx) o.mx = F[id];
  }
  console.log('\n-- regions (sorted by inradius) --');
  info.map((o, k) => ({
    k, area: o.n * step * step, inr: o.mx,
    r: Math.hypot(o.sx / o.n, o.sy / o.n),
    th: Math.atan2(o.sy / o.n, o.sx / o.n) * 180 / Math.PI,
  })).sort((a, b) => a.inr - b.inr).forEach(o => console.log(
    `reg${String(o.k).padStart(2)} inr=${o.inr.toFixed(4)}mm area=${o.area.toFixed(3)}mm2 ` +
    `centroid r=${o.r.toFixed(2)} th=${o.th.toFixed(1)}`));
}
