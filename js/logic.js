// ═══════════════════════════════════
//  FIREBASE HELPERS
// ═══════════════════════════════════
function fbSet(path, data) {
  if (window.__fbSet) return window.__fbSet(path, data);
}
function fbOn(path, cb) {
  const try_ = () => {
    if (window.__fbOn) { window.__fbOn(path, cb); }
    else setTimeout(try_, 200);
  };
  try_();
}

// ═══════════════════════════════════
//  BP TABLE & SCORING
// ═══════════════════════════════════
function calcBP(vp1, vp2, table) {
  const diff = Math.abs(vp1 - vp2);
  let w = 10;
  for (const row of table) if (diff >= row.lo && diff < row.hi) w = row.w;
  const l = 20 - w;
  if (vp1 === vp2) return {bp1:10, bp2:10};
  return vp1 > vp2 ? {bp1:w, bp2:l} : {bp1:l, bp2:w};
}
function wdl(bp) { return bp > 10 ? 'W' : bp < 10 ? 'L' : 'D'; }

// ═══════════════════════════════════
//  PLAYER STATS
// ═══════════════════════════════════
function getPlayerBP(id, matches, bpTable) {
  let bp = 0;
  matches.forEach(rd => rd.pairs.forEach(p => {
    if (p.bye && p.p1 === id) { bp += 20; return; }
    if (p.bye) return;
    if (p.p1 !== id && p.p2 !== id) return;
    if (p.vp1 == null) return;
    const c = calcBP(p.vp1, p.vp2, bpTable);
    if (p.p1 === id) bp += c.bp1; else bp += c.bp2;
  }));
  return bp;
}
function getPlayerVP(id, matches) {
  let vp = 0;
  matches.forEach(rd => rd.pairs.forEach(p => {
    if (p.bye && p.p1 === id) return;
    if (p.p1 !== id && p.p2 !== id) return;
    if (p.vp1 == null) return;
    if (p.p1 === id) vp += p.vp1; else vp += p.vp2;
  }));
  return vp;
}
function getPlayerRec(id, matches, bpTable) {
  let w=0,d=0,l=0;
  matches.forEach(rd => rd.pairs.forEach(p => {
    if (p.bye && p.p1 === id) { w++; return; }
    if (p.bye) return;
    if (p.p1 !== id && p.p2 !== id) return;
    if (p.vp1 == null) return;
    const c = calcBP(p.vp1, p.vp2, bpTable);
    const r = wdl(p.p1 === id ? c.bp1 : c.bp2);
    if (r==='W') w++; else if (r==='D') d++; else l++;
  }));
  return {w,d,l};
}
function getSOS(id, matches, bpTable) {
  let s = 0;
  matches.forEach(rd => rd.pairs.forEach(p => {
    if (p.bye) return; if (p.vp1 == null) return;
    if (p.p1 !== id && p.p2 !== id) return;
    if (p.p1 === id) s += getPlayerBP(p.p2, matches, bpTable);
    else s += getPlayerBP(p.p1, matches, bpTable);
  }));
  return s;
}
function getH2H(a, b, matches, bpTable) {
  let ta=0,tb=0;
  matches.forEach(rd => rd.pairs.forEach(p => {
    if (p.vp1 == null) return;
    if (p.p1===a&&p.p2===b){const c=calcBP(p.vp1,p.vp2,bpTable);ta+=c.bp1;tb+=c.bp2;}
    if (p.p1===b&&p.p2===a){const c=calcBP(p.vp1,p.vp2,bpTable);tb+=c.bp1;ta+=c.bp2;}
  }));
  return {ta,tb};
}
function haveMet(a, b, matches) {
  return matches.some(rd => rd.pairs.some(p => (p.p1===a&&p.p2===b)||(p.p1===b&&p.p2===a)));
}
function rdDone(rd) {
  return rd && rd.pairs.every(p => p.bye || (p.vp1!=null && p.vp2!=null));
}

// ═══════════════════════════════════
//  SWISS PAIRING
// ═══════════════════════════════════
function generatePairings(players, matches, bpTable, roundNum) {
  const active = players.filter(p => !p.dropped);
  const sorted = [...active].sort((a,b) => {
    const ba=getPlayerBP(a.id,matches,bpTable), bb=getPlayerBP(b.id,matches,bpTable);
    if (ba!==bb) return bb-ba;
    const sa=getSOS(a.id,matches,bpTable), sb=getSOS(b.id,matches,bpTable);
    if (sa!==sb) return sb-sa;
    return getPlayerVP(b.id,matches)-getPlayerVP(a.id,matches);
  });

  let pool=[...sorted], byePlayer=null;
  if (pool.length%2!==0) {
    for (let i=pool.length-1;i>=0;i--) {
      if (!matches.some(rd=>rd.pairs.some(pr=>pr.bye&&pr.p1===pool[i].id))) {
        byePlayer=pool.splice(i,1)[0]; break;
      }
    }
    if (!byePlayer) byePlayer=pool.pop();
  }

  // Round when a and b last faced each other (0 = never)
  function lastMet(a, b) {
    for (let r=matches.length-1; r>=0; r--) {
      if (matches[r].pairs.some(p=>(p.p1===a&&p.p2===b)||(p.p1===b&&p.p2===a)))
        return matches[r].round;
    }
    return 0;
  }

  const paired=[];
  function tryPair(pl) {
    if (!pl.length) return true;
    const first=pl[0];
    // 1. Try non-repeat pairings in standing order
    for (let i=1;i<pl.length;i++) {
      if (haveMet(first.id,pl[i].id,matches)) continue;
      const rest=pl.filter((_,j)=>j!==0&&j!==i);
      if (tryPair(rest)){paired.push({p1:first,p2:pl[i]});return true;}
    }
    // 2. Forced repeat — pick opponent met least recently
    if (pl.length>=2) {
      let bestI=1, bestRound=Infinity;
      for (let i=1;i<pl.length;i++) {
        const r=lastMet(first.id,pl[i].id);
        if (r<bestRound){bestRound=r;bestI=i;}
      }
      paired.push({p1:first,p2:pl[bestI]});
      return tryPair(pl.filter((_,j)=>j!==0&&j!==bestI));
    }
    return false;
  }
  tryPair(pool);

  // Table assignment: standings order (pair 0 = table 1).
  // Then try swapping adjacent pairs (except table 1) to reduce same-table repeats.
  const prevTable={};
  if (matches.length>0) {
    const last=matches[matches.length-1];
    last.pairs.forEach(p=>{if(!p.bye){prevTable[p.p1]=p.table;prevTable[p.p2]=p.table;}});
  }
  const tables=paired.map((_,i)=>i+1);
  for (let i=1;i<paired.length-1;i++) {
    const [pa,pb]=[paired[i],paired[i+1]];
    const [ta,tb]=[tables[i],tables[i+1]];
    const cost = (x,t)=>(prevTable[x.p1.id]===t?1:0)+(prevTable[x.p2.id]===t?1:0);
    if (cost(pa,tb)+cost(pb,ta) < cost(pa,ta)+cost(pb,tb)) {
      tables[i]=tb; tables[i+1]=ta;
    }
  }

  const pairs=paired.map((m,i)=>({table:tables[i],p1:m.p1.id,p2:m.p2.id,vp1:null,vp2:null,bye:false}));
  if (byePlayer) pairs.push({table:paired.length+1,p1:byePlayer.id,p2:null,vp1:null,vp2:null,bye:true});
  return {round:roundNum, pairs};
}

// ═══════════════════════════════════
//  STANDINGS CALCULATOR
// ═══════════════════════════════════
function calcStandings(players, matches, bpTable) {
  return players.map(p=>({
    ...p,
    bp:  getPlayerBP(p.id,matches,bpTable),
    vp:  getPlayerVP(p.id,matches),
    sos: getSOS(p.id,matches,bpTable),
    rec: getPlayerRec(p.id,matches,bpTable),
  })).sort((a,b)=>{
    if (a.bp!==b.bp) return b.bp-a.bp;
    if (a.vp!==b.vp) return b.vp-a.vp;
    const hh=getH2H(a.id,b.id,matches,bpTable);
    if (hh.ta!==hh.tb) return hh.tb-hh.ta;
    return b.sos-a.sos;
  });
}
