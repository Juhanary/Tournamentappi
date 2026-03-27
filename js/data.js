// ═══════════════════════════════════
//  BP TABLE DEFAULT
// ═══════════════════════════════════
const DEFAULT_BP = [
  {lo:0,   hi:200,  w:10},{lo:200, hi:400,  w:11},{lo:400, hi:600,  w:12},
  {lo:600, hi:800,  w:13},{lo:800, hi:1000, w:14},{lo:1000,hi:1200, w:15},
  {lo:1200,hi:1500, w:16},{lo:1500,hi:1800, w:17},{lo:1800,hi:2200, w:18},
  {lo:2200,hi:99999,w:20},
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
