// Test the TREE model: parse -> build -> emit round-trips real .xst byte-for-byte,
// and stroke-cutting by pressure events yields correct counts.
const fs = require('fs');
const path = require('path');
const BASE = 'C:/Users/Nel/xst-editor';
const PAINT = 'C:/Users/Nel/saved_paintings';

const html = fs.readFileSync(path.join(BASE, 'index.html'), 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.error('no script'); process.exit(1); }
let body = m[1].replace(/if\(typeof document!=='undefined'[\s\S]*$/, '');
const API = new Function(body + '\n;return {parseXST,emitXST,buildTree,flatten,findScalar};')();

const files = ['_beauty_天_plain.xst','_beauty_天_B.xst','_beauty_na_A_blade.xst'];
let pass = true;

for (const f of files) {
  const p = path.join(PAINT, f);
  if (!fs.existsSync(p)) { console.log('SKIP '+f); continue; }
  const text = fs.readFileSync(p, 'utf8').replace(/\r/g, '');
  const doc = API.parseXST(text);
  const out = API.emitXST(doc);
  const inL = text.split('\n'), outL = out.split('\n');
  let diff = 0, first = '';
  const n = Math.max(inL.length, outL.length);
  for (let i = 0; i < n; i++) {
    const a = (inL[i]||'').trim(), b = (outL[i]||'').trim();
    if (a !== b) { diff++; if (!first) first = `  line ${i}: in=[${a}] out=[${b}]`; }
  }
  // pressure index check on strokes
  let badP = 0;
  for (const st of doc.tree.strokes) for (const o of st.frames) {
    const toks = o.raw.split(/\s+/); const last = parseFloat(toks[toks.length-1]);
    if (Math.abs(last - o.pressure) > 1e-9) badP++;
  }
  // each stroke must have >=1 press frame and start/end at pen-up (pressure 0) except possibly head
  let badStruct = 0;
  for (const st of doc.tree.strokes) {
    const press = st.frames.filter(f=>f.pressure>0).length;
    const lastP = st.frames[st.frames.length-1].pressure;
    if (press===0) badStruct++;
    if (lastP!==0) badStruct++; // brush-up at end
  }
  const ok = diff===0 && badP===0 && badStruct===0;
  if (!ok) pass = false;
  console.log(`${ok?'PASS':'FAIL'} ${f} | strokes=${doc.tree.strokes.length} s-frames=${doc.tree.strokes.reduce((a,s)=>a+s.frames.length,0)} diffs=${diff} badP=${badP} badStruct=${badStruct}`);
  if (first) console.log(first);
}

// edit + cut test: split pressure events
{
  const text = "s 0 0 0 0 0 0 0\ns 0.1 0 0 0 0 0 0.5\ns 0.2 0 0 0 0 0 0\ns 0.2 0.1 0 0 0 0 0\ns 0.2 0.2 0 0 0 0 0.5\ns 0.2 0.3 0 0 0 0 0\n";
  const doc = API.parseXST(text);
  const ok = doc.tree.strokes.length===2
    && doc.tree.strokes[0].frames.length===3
    && doc.tree.strokes[1].frames.length===3
    && doc.tree.strokes[0].frames[0].pressure===0
    && doc.tree.strokes[1].frames[0].pressure===0;
  console.log(`CUT test (brush-down/up): ${ok?'PASS':'FAIL'} strokes=${doc.tree.strokes.length} lens=${doc.tree.strokes.map(s=>s.frames.length)}`);
  if(!ok) pass=false;
}

// config-attachment test: brush config in gap between strokes
{
  const text = "w 0.09\ns 0 0 0 0 0 0 0.5\ns 1 0 0 0 0 0 0\nB 3\ni 0.2\ns 2 0 0 0 0 0 0.4\ns 3 0 0 0 0 0 0\n";
  const doc = API.parseXST(text);
  const ok = doc.tree.prelude.length===1 // w 0.09
    && doc.tree.strokes.length===2
    && doc.tree.strokes[0].config.length===0
    && doc.tree.strokes[1].config.length===2 // B 3, i 0.2
    && doc.tree.strokes[1].frames.length===2;
  console.log(`CONFIG-attach test: ${ok?'PASS':'FAIL'} pre=${doc.tree.prelude.length} strokes=${doc.tree.strokes.length} cfg1=${doc.tree.strokes[1].config.map(c=>c.cmd)}`);
  if(!ok) pass=false;
}

console.log(pass ? '\nALL PASS' : '\nSOME FAILED');
process.exit(pass?0:1);
