// Web Audio = H B T einhaltend mit ECHO HALL REHALL
const ctx = new AudioContext();

// HÖHE = Höhe = RISE/DROP
const heightGain = ctx.createGain(); // Y

// BREITE = Breite = SHIFT  
const widthPanner = ctx.createStereoPanner(); // X = -1 links +1 rechts

// TIEFE = Tiefe = PUSH/PULL
const depthPanner = ctx.createPanner(); // Z = rein raus
depthPanner.panningModel = 'HRTF';

// ECHO = einfaches Delay = BIO
const echo = ctx.createDelay(1.0);
echo.delayTime.value = 0.25; // 250ms Echo

// HALL = Reverb = BIOS = Aura
const hall = ctx.createConvolver(); // Hall = Raum

// REHALL = Re-Hall = B.I.O = Zen = Hall in Hall
const rehall = ctx.createConvolver(); // ReHall = Hall in Hall = ZEN

// Kette: Source -> BREITE(X) -> HÖHE(Y) -> TIEFE(Z) -> ECHO -> HALL -> REHALL -> OUT
source.connect(widthPanner)   // BREITE
  .connect(heightGain)        // HÖHE
  .connect(depthPanner)       // TIEFE = einhaltend
  .connect(echo)              // ECHO nutzend
  .connect(hall)              // HALL nutzend
  .connect(rehall)            // REHALL nutzend
  .connect(ctx.destination);

// H B T einhaltend = alle 3 Achsen bleiben
// ECHO HALL REHALL nutzend = 3 Audio Räume
// = MANA AURA ZEN = BIO BIOS B.I.O
