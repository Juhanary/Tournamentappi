// ═══════════════════════════════════
//  BP TABLE DEFAULT
// ═══════════════════════════════════
const DEFAULT_BP = [
  {lo:0,   hi:200,  w:10},{lo:200, hi:400,  w:11},{lo:400, hi:600,  w:12},
  {lo:600, hi:800,  w:13},{lo:800, hi:1000, w:14},{lo:1000,hi:1200, w:15},
  {lo:1200,hi:1500, w:16},{lo:1500,hi:1800, w:17},{lo:1800,hi:2200, w:18},
  {lo:2200,hi:99999,w:20},
];
// AoS: Major Win (5+ VP diff)=20BP, Minor Win (1-4)=13BP, Draw(0)=10BP
const DEFAULT_BP_AOS = [
  {lo:0, hi:1,     w:10},
  {lo:1, hi:5,     w:13},
  {lo:5, hi:99999, w:20},
];
// Simple W/D/L: any VP diff ≥1 = Win(20BP), diff=0 = Draw(10BP)
const SIMPLE_BP_TABLE = [
  {lo:0, hi:1,     w:10},
  {lo:1, hi:99999, w:20},
];

// ═══════════════════════════════════
//  40K & AOS MISSIONS
//  Landscape orientation: table 60"(W) × 44"(H)
//  Long edges  = top & bottom (60" wide) → 'long-N'  zones: top/bottom strips
//  Short edges = left & right (44" tall) → 'short-N' zones: left/right strips
//  Objectives: x=0..1 (left→right), y=0..1 (top→bottom)
// ═══════════════════════════════════
const MISSIONS_40K = [
  // 1. Search & Destroy — diagonal, each player in a triangular half
  {id:1, name:'Search and Destroy', deploy:'diagonal',
   desc:'Diagonal split. P1 top-left triangle, P2 bottom-right. Table 44"×60".',
   objectives:[{x:.5,y:.5},{x:.22,y:.27},{x:.78,y:.73},{x:.5,y:.18},{x:.5,y:.82}]},

  // 2. Tipping Point — 9" from long (top/bottom) edges
  {id:2, name:'Tipping Point', deploy:'long-9',
   desc:'Deploy within 9" of long edge. No-man\'s-land 26". Table 44"×60".',
   objectives:[{x:.5,y:.5},{x:.2,y:.3},{x:.8,y:.3},{x:.2,y:.7},{x:.8,y:.7}]},

  // 3. Close Engagement — 9" from short (left/right) edges
  {id:3, name:'Close Engagement', deploy:'short-9',
   desc:'Deploy within 9" of short edge. No-man\'s-land 42". Table 44"×60".',
   objectives:[{x:.5,y:.5},{x:.3,y:.2},{x:.3,y:.8},{x:.7,y:.2},{x:.7,y:.8}]},

  // 4. Hammer and Anvil — 12" from short (left/right) edges
  {id:4, name:'Hammer and Anvil', deploy:'short-12',
   desc:'Deploy within 12" of short edge. No-man\'s-land 36". Table 44"×60".',
   objectives:[{x:.5,y:.5},{x:.33,y:.2},{x:.33,y:.8},{x:.67,y:.2},{x:.67,y:.8}]},

  // 5. Crucible of Battle — triangular corner zones, 18" legs
  {id:5, name:'Crucible of Battle', deploy:'diagonal-corner-18',
   desc:'Triangular corner zones, 18" along each edge. Table 44"×60".',
   objectives:[{x:.5,y:.5},{x:.25,y:.3},{x:.75,y:.7},{x:.5,y:.22},{x:.5,y:.78}]},

  // 6. Dawn of War — 6" from long (top/bottom) edges
  {id:6, name:'Dawn of War', deploy:'long-6',
   desc:'Deploy within 6" of long edge. No-man\'s-land 32". Table 44"×60".',
   objectives:[{x:.5,y:.5},{x:.2,y:.36},{x:.8,y:.36},{x:.2,y:.64},{x:.8,y:.64}]},
];

// ═══════════════════════════════════
//  AOS MISSIONS  (table 44"×60", landscape)
// ═══════════════════════════════════
const MISSIONS_AOS = [
  // 1. Savage Gains — 12" from long edges, 3 objectives on centre line
  {id:1, name:'Savage Gains', deploy:'long-12',
   desc:'Deploy within 12" of long edge. No-man\'s-land 20". Table 44"×60".',
   objectives:[{x:.5,y:.5},{x:.2,y:.5},{x:.8,y:.5},{x:.5,y:.28},{x:.5,y:.72}]},

  // 2. Ours for the Taking — diagonal
  {id:2, name:'Ours for the Taking', deploy:'diagonal',
   desc:'Diagonal deployment split. Table 44"×60".',
   objectives:[{x:.5,y:.5},{x:.25,y:.25},{x:.75,y:.75},{x:.25,y:.75},{x:.75,y:.25}]},

  // 3. Battle for the Pass — 12" from short edges
  {id:3, name:'Battle for the Pass', deploy:'short-12',
   desc:'Deploy within 12" of short edge. No-man\'s-land 36". Table 44"×60".',
   objectives:[{x:.5,y:.5},{x:.33,y:.25},{x:.33,y:.75},{x:.67,y:.25},{x:.67,y:.75}]},

  // 4. Tectonic Interference — corner triangles, 14" legs
  {id:4, name:'Tectonic Interference', deploy:'diagonal-corner-14',
   desc:'Triangular corner zones, 14" legs. Table 44"×60".',
   objectives:[{x:.5,y:.5},{x:.3,y:.3},{x:.7,y:.7},{x:.3,y:.7},{x:.7,y:.3}]},

  // 5. Clash of Spearheads — 9" from long edges
  {id:5, name:'Clash of Spearheads', deploy:'long-9',
   desc:'Deploy within 9" of long edge. No-man\'s-land 26". Table 44"×60".',
   objectives:[{x:.5,y:.5},{x:.25,y:.33},{x:.75,y:.33},{x:.25,y:.67},{x:.75,y:.67}]},
];

// ═══════════════════════════════════
//  SCENARIO DATA
// ═══════════════════════════════════
const SCENARIO_MAPS = {
  1:'scenario-1.jpg',
  2:'scenario-2.jpg',
  3:'scenario-3.jpg',
  4:'scenario-4.jpg',
  5:'scenario-5.jpg',
  6:'scenario-6.jpg',
};

const OBJECTIVE_MAPS = {
  'strategic-2': 'objectives-1.jpg',
  'strategic-3': 'objectives-2.jpg',
  'strategic-4': 'objectives-3.jpg',
};

const SCENARIOS = [
  {id:1, name:'Upon the Field of Glory',
    desc:'Two rival forces meet on an open battlefield. Full armies, no special rules.',
    special:'No special rules.',
    gameLength:'Fixed Turn, Random, or Break Point',
    secRequired:[],
    secAllowed:['baggage','special-features','domination','strategic-2','strategic-3','strategic-4'],
  },
  {id:2, name:'King of the Hill',
    desc:'Control the central hill. Core unit (US10+) within 9" controls it. +100VP per player turn held.',
    special:'Hill in centre. Core unit US10+ within 9" controls. +100VP per player turn held. No Vanguard moves.',
    gameLength:'Random Game Length or Break Point',
    secRequired:[],
    secAllowed:['baggage','special-features'],
  },
  {id:3, name:'Drawn Battlelines',
    desc:'Roll D6 before deployment — on a 1, both players hold one Infantry/Cavalry unit in reserve.',
    special:'Reserves enter from own deployment edge from turn 2 onward (Compulsory Moves sub-phase).',
    gameLength:'Fixed Turn or Random Game Length',
    secRequired:['strategic-3'],
    secAllowed:['domination','baggage'],
  },
  {id:4, name:'Close Quarters',
    desc:'Narrow mountain pass. Short battlefield edges are impassable terrain.',
    special:'Bottleneck: short edges = impassable. Only Fly(X) or Ethereal units may enter/exit short edges.',
    gameLength:'Fixed Turn or Break Point',
    secRequired:['strategic-2'],
    secAllowed:['domination'],
  },
  {id:5, name:'A Chance Encounter',
    desc:'Armies stumble into each other. Four diagonal deployment zones — winner picks A or B pair.',
    special:'Special Feature placed in centre. Four diagonal deployment zones (A1/A2 or B1/B2).',
    gameLength:'Random Game Length or Break Point',
    secRequired:['special-features'],
    secAllowed:['domination','baggage'],
  },
  {id:6, name:'Encirclement',
    desc:'Deployment zones on long edges — crush the enemy flanks.',
    special:'No special rules.',
    gameLength:'Fixed Turn or Random Game Length',
    secRequired:['strategic-4'],
    secAllowed:['baggage','special-features'],
  },
];

const SEC_OBJ = {
  'baggage':     {name:'Baggage Trains',      icon:'🎒', desc:'+100VP control, +250VP destroy. 60×100mm base in own deployment zone.'},
  'special-features':{name:'Special Features',icon:'🏛', desc:'+200VP at end if controlled. Centre of battlefield. D6 unusual property each turn.'},
  'domination':  {name:'Domination',          icon:'⚑',  desc:'+100VP per quarter controlled. +50VP if US doubled. +100VP if uncontested.'},
  'strategic-2': {name:'Strategic Locations (2)',icon:'📍',desc:'2 objective markers. +30VP per marker per player turn controlled. Core US10+ within 6".'},
  'strategic-3': {name:'Strategic Locations (3)',icon:'📍',desc:'3 objective markers. +30VP per marker per player turn controlled.'},
  'strategic-4': {name:'Strategic Locations (4)',icon:'📍',desc:'4 objective markers. +30VP per marker per player turn controlled.'},
};
