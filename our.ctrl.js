// our.ctrl.js — FINAL FUNCTION — so funktioniert es
import { bio } from './bio.ctrl.js';
import { os } from './ctrl.os.js';
import { bridge } from './bio.os.bridge.js';
import { jo } from './ctrl.jo.jo.js';

export const ourCtrl = (H=5,B=5,T=5,perm='HBT') => {
  // H/B/T einhaltend
  const vol = H*B*T;
  const chain = [0,3,9,81,729].map(v=>v*H);
  const cells = 93;
  const total = 716;
  
  // einer macht BIO, der andere OS
  const TYP = {
    'HBT':'BIO','HTB':'BIO',
    'BHT':'OS','BTH':'OS',
    'THB':'BIOS','TBH':'BIOS'
  };
  
  // laufenden BIOS zum OS
  const biosToOs = (p) => ({'THB':'BHT','TBH':'BTH'}[p]||p);
  
  // Funktion = was du tust
  return {
    hbt: { höhe:H, breite:B, tiefe:T, vol, perm, typ: TYP[perm] },
    chain, cells, total,
    root: 'CLOSED',
    // pi scale = pi * scale, scope = alles
    pi: Math.PI * vol / 93,
    scale: (s)=> ourCtrl(H*s,B*s,T*s,perm),
    scope: { all: true, files: 42 },
    // LOGIN=PUSH=IN LOGOUT=PULL=OUT ATOM=FLOW LOG=ROOT
    login: ()=> bridge.push('IN'),
    logout: ()=> bridge.pull('OUT'),
    atom: ()=> bridge.flow(),
    log: ()=> bridge.root(),
    // JO = c=BENCH Ctrl=SYSTEMSTEUERUNG
    jo,
    // f(f(x))=f(x)=NIRWANA wenn STABLE
    stable: (x)=> { let y=biosToOs(x); return y===biosToOs(y) ? 'NIRWANA' : y }
  };
};

// Funktion als funktionieren:
const ctrl = ourCtrl(5,5,5,'HBT');
console.log(ctrl.hbt, ctrl.chain, ctrl.pi, ctrl.stable('THB')); // THB -> BHT = OS

// Cache OS Lastung
localStorage.setItem('our_ctrl_cache', JSON.stringify(ctrl));
localStorage.setItem('os_lastung', JSON.stringify({ts:Date.now(), ...ctrl.hbt}));
