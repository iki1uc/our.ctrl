// ctrl.jo.jo.js — Joystick + Ctrl + c als BENCH / SYSTEMSTEUERUNG / H/B/T
// H/B/T einhaltend, ECHO HALL REHALL nutzend, resonancieren
// Usage: import { jo } from './ctrl.jo.jo.js' — jo = joystick handler

export const JO = {
  // H/B/T = Höhe Breite Tiefe = 3 Achsen = Joystick Achsen
  axes: { höhe: 5, breite: 5, tiefe: 5 }, // 1-9
  perm: 'HBT', // HBT, HTB, BHT, BTH, THB, TBH
  chain: [0,3,9,81,729],
  events: { bench: 'our_ctrl_bench', system: 'our_ctrl_system', sat: 'our_ctrl_sat', weather: 'our_ctrl_weather' }
};

// Joystick -> H/B/T mapping
export function joStickToHBT(x, y, z){
  // x = Breite = SHIFT = -1..1 -> 1..9
  // y = Höhe = RISE/DROP = -1..1 -> 1..9
  // z = Tiefe = PUSH/PULL = -1..1 -> 1..9
  const map = v => Math.min(9, Math.max(1, Math.round((v+1)*4+1)));
  return { höhe: map(y), breite: map(x), tiefe: map(z), vol: map(y)*map(x)*map(z) };
}

// Permutation aus Joystick Richtung
export function joDirectionToPerm(x, y){
  const ang = Math.atan2(y, x) * 180/Math.PI;
  if(ang > -30 && ang <= 30) return 'BHT'; // → Breite
  if(ang > 30 && ang <= 90) return 'BTH'; // ↘
  if(ang > 90 && ang <= 150) return 'TBH'; // ↙
  if(ang > 150 || ang <= -150) return 'THB'; // ↓ Tiefe
  if(ang > -150 && ang <= -90) return 'HTB'; // ↗
  return 'HBT'; // ↑ Höhe
}

// Ctrl = SYSTEMSTEUERUNG, c = BENCH — ereignisieren statt rauswerfen
export function bindCtrlJoJo({ onBench, onSystem, onHBT }){
  window.addEventListener('keydown', (e)=>{
    if(e.target.tagName==='INPUT' || e.target.tagName==='TEXTAREA') return;
    if(e.key.toLowerCase()==='c' && !e.ctrlKey){
      e.preventDefault(); e.stopPropagation();
      window.dispatchEvent(new CustomEvent(JO.events.bench, { detail: { key:'c' }}));
      onBench?.();
    }
    if(e.key==='Control' || (e.ctrlKey && e.key.toLowerCase()!=='c')){
      e.preventDefault(); e.stopPropagation();
      window.dispatchEvent(new CustomEvent(JO.events.system, { detail: { key:'ctrl' }}));
      onSystem?.();
    }
  }, true);

  // Joystick API
  window.addEventListener('gamepadconnected', (e)=>{
    console.log(`JO connected: ${e.gamepad.id} — H/B/T über Joystick`);
  });

  // Poll joystick
  let last={};
  function poll(){
    const pads=navigator.getGamepads?.();
    if(pads){
      for(const pad of pads){
        if(!pad) continue;
        const [x,y,z] = [pad.axes[0]||0, pad.axes[1]||0, pad.axes[2]||0];
        const hbt = joStickToHBT(x,y,z);
        const perm = joDirectionToPerm(x,y);
        if(hbt.höhe!==last.höhe || hbt.breite!==last.breite || hbt.tiefe!==last.tiefe || perm!==last.perm){
          last={...hbt, perm};
          JO.axes=hbt; JO.perm=perm;
          window.dispatchEvent(new CustomEvent('our_ctrl_hbt', { detail: { hbt, perm, chain: JO.chain.map(v=>v*hbt.höhe) }}));
          onHBT?.(hbt, perm);
        }
        // Buttons: 0 = BENCH, 1 = SYSTEM
        if(pad.buttons[0]?.pressed) window.dispatchEvent(new CustomEvent(JO.events.bench));
        if(pad.buttons[1]?.pressed) window.dispatchEvent(new CustomEvent(JO.events.system));
      }
    }
    requestAnimationFrame(poll);
  }
  poll();
}

// Resonanz = H/B/T schwingen zusammen
export function resonance(h,b,t, time=0){
  return Math.abs(Math.sin(h*0.3)*Math.cos(b*0.3)*Math.sin(t*0.3+time*0.2))*100;
}

// SAT Richtungen = chain Orbits
export function satDirections(h){
  return JO.chain.map((c,i)=>({ deg:c, radius:120+i*18+h*3, label:`${c}°` }));
}

// Wetter = ECHO HALL REHALL
export function weatherResonance(){
  return { echo:Math.random(), hall:Math.random(), rehall:Math.random(), temp:Math.random()*100 };
}

// Export für HTML
export const jo = { JO, joStickToHBT, joDirectionToPerm, bindCtrlJoJo, resonance, satDirections, weatherResonance };
