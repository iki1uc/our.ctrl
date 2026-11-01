import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Triangle, Cylinder, Box, Atom, Pyramid, Scale, Sprout, Cpu, Download,
  Play, RotateCcw, Save, FolderOpen, Trash2, Zap, Dices, Sprout as SeedIcon,
  Users, MapPin, Activity, ChevronRight, CircleDot, Layers, Gauge, Terminal,
  Package, Grid3x3, Weight, Route, ShieldCheck, Eye, RefreshCw, X,
} from "lucide-react";

/* ============================================================
   REAL OS — ALLES ACHSEN BEWEGLICH
   3-Eck · her.9.can · u.api · our.ctrl · TOOLATOR · BATCH · KARTOR
   ============================================================ */

type Vec3 = { h: number; b: number; t: number };
type GeoKind = "dreieck" | "zylinder" | "wuerfel" | "atom" | "pyramide";

interface GeoObj {
  id: string;
  kind: GeoKind;
  label: string;
  x: number; // % on canvas
  y: number; // % on canvas
  rot: number;
  scale: number;
  pos: Vec3;
  color: string;
}

interface KartorModule {
  id: number;
  name: string;
  level: number;
  flow: string;
  sector: string;
  geo: GeoKind | "karte";
  score: number;
  empty?: boolean;
}

const LEVELS = [3, 9, 27, 81, 243, 729];
const FLOWS = ["IN", "WORK", "OUT", "MEM"];
const SECTORS = ["ZEN", "AXM", "AUR", "CLI", "GPU", "MNA", "CTY", "LOG", "HDF", "TMP"];
const PERMS: { key: string; label: string; order: ("h" | "b" | "t")[] }[] = [
  { key: "HBT", label: "H·B·T", order: ["h", "b", "t"] },
  { key: "HTB", label: "H·T·B", order: ["h", "t", "b"] },
  { key: "BHT", label: "B·H·T", order: ["b", "h", "t"] },
  { key: "BTH", label: "B·T·H", order: ["b", "t", "h"] },
  { key: "THB", label: "T·H·B", order: ["t", "h", "b"] },
  { key: "TBH", label: "T·B·H", order: ["t", "b", "h"] },
];
const SEED_CHAIN = [0, 3, 9, 27, 81, 243, 729, 730];
const WEGE = [
  { id: "kansas", label: "OS · KANSAS", sub: "Dorothy", color: "#fbbf24" },
  { id: "neural", label: "NC · NEURAL", sub: "Scarecrow", color: "#66ccff" },
  { id: "core", label: "SC · CORE", sub: "Tin Man", color: "#34d399" },
  { id: "lion", label: "FOR ALL · LION", sub: "Lion", color: "#f472b6" },
  { id: "oz", label: "OZ · WIZARD", sub: "Wizard", color: "#a78bfa" },
];
const AXIOME = [
  { id: "WEG", grp: "α" }, { id: "AUSWEG", grp: "α" }, { id: "EINWEG", grp: "α" },
  { id: "CPU", grp: "β" }, { id: "Co-CPU", grp: "β" }, { id: "BUS", grp: "β" },
  { id: "PRISMA", grp: "γ" }, { id: "PYRA", grp: "γ" },
];
const ORGANE = ["VECTOR", "PRISMATIC", "PYRAMIDE", "CPUCO", "3TEL", "ENERGIE", "MAGMA", "PLAYER", "9x9", "TERMINAL", "TODO", "KALENDER", "PAINT"];
const GEO_META: Record<GeoKind, { label: string; color: string; Icon: React.ElementType }> = {
  dreieck: { label: "DREIECK", color: "#fbbf24", Icon: Triangle },
  zylinder: { label: "ZYLINDER", color: "#66ccff", Icon: Cylinder },
  wuerfel: { label: "WÜRFEL", color: "#34d399", Icon: Box },
  atom: { label: "ATOM", color: "#f0f", Icon: Atom },
  pyramide: { label: "PYRAMIDE", color: "#f472b6", Icon: Pyramid },
};

const REAL_NAMES = [
  "api.html", "cpu.html", "gpu.html", "ram.html", "rom.html", "tool.html", "ori.html", "ID.html",
  "index.html", "3.time.md", "call_log", "9.js", "81.js", "729.js", "R4L.js", "gpu.html·IceFeuer",
  "3.eck", "her.9.can", "u.api.html", "ctrl.ler.html", "bio.ctrl.ler.html", "our.ctrl", "auto.os",
  "VESTA", "ROLL", "RECHNE", "PIPELINE", "SEED", "MIX", "KARTOR", "BATCH", "ZIP·2138KB",
  "LS_City_Desert", "Q9·19683", "f.rom", "W(a(s(d)))", "El Burro", "HBT·6", "WAAGE", "NEUGEBUNG",
  "991199=F1FDF", "Σ2268", "4TEL·567", "P0", "P1", "P2", "P3", "Pe", "man", "woman", "du",
  "Berlin·honest", "Dr=81", "tex·60", "COUNT=9",
];

function kartorAddr(m: KartorModule, axes: Vec3): string {
  const w = Math.max(0, Math.round((axes.h + axes.b + axes.t) / 3 + m.score / 10));
  return `${m.level}.${m.flow}.${m.sector}.${String(w).padStart(2, "0")}`;
}

function buildModules(axes: Vec3): KartorModule[] {
  const geos: (GeoKind | "karte")[] = ["dreieck", "zylinder", "wuerfel", "atom", "pyramide", "karte"];
  const out: KartorModule[] = [];
  for (let i = 0; i < 81; i++) {
    const empty = i >= 56;
    out.push({
      id: i + 1,
      name: empty ? `SLOT ${String(i - 55).padStart(2, "0")} · FREI` : REAL_NAMES[i],
      level: LEVELS[i % LEVELS.length],
      flow: FLOWS[i % FLOWS.length],
      sector: SECTORS[i % SECTORS.length],
      geo: geos[i % geos.length],
      score: empty ? 0 : 40 + ((i * 37) % 61),
      empty,
    });
  }
  return out;
}

const TOOLATOR_LOGS = [
  { id: "vesta", txt: "VESTA · System geweiht · EIN OS v3 wach", geo: "pyramide" as GeoKind },
  { id: "roll", txt: "ROLL 81→27→3→0 · Kollaps bereit", geo: "wuerfel" as GeoKind },
  { id: "rechne", txt: "RECHNE 3 · 9 · 81 · Potenzkette stabil", geo: "atom" as GeoKind },
  { id: "pipe", txt: "PIPELINE P0→Pe · 6 Stufen · emerald", geo: "zylinder" as GeoKind },
  { id: "seed", txt: "SEED 0⊃3⊃9⊃27⊃81⊃243⊃729→730 FREI", geo: "dreieck" as GeoKind },
  { id: "mix", txt: "MIX H/B/T · man / woman / du · 3 Stimmen", geo: "atom" as GeoKind },
  { id: "kartor", txt: "KARTOR · LEVEL.FLOW.SECTOR.WEIGHT aktiv", geo: "pyramide" as GeoKind },
  { id: "burro", txt: "EL BURRO · f(f(x))=f(x) · steht immer wieder auf", geo: "wuerfel" as GeoKind },
];
const BATCH_LOGS = [
  "COUNT=9 · 1920×1080 · 9 Bilder bereit",
  "Dr=81 · Gewicht auf Waage gelegt",
  "LS_City_Desert · Landschaft gesetzt",
  "widgets 1651/860/400/1302/232 · 5 Screens",
  "tex 60 · Texturen gezählt",
  "zip 2138KB · Download simuliert",
  "Q9 19683→730 FREI · Quotient offen",
  "Berlin honest placement · ehrlich platziert",
  "f.rom W(a(s(d))) · verschachtelt gelesen",
];

async function api(action: string, args: Record<string, unknown>) {
  const res = await fetch("actions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, args }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) throw new Error(json.error || `HTTP ${res.status}`);
  return json.data;
}

export default function App() {
  const [axes, setAxes] = useState<Vec3>({ h: 50, b: 50, t: 50 });
  const [perm, setPerm] = useState("HBT");
  const [weg, setWeg] = useState("kansas");
  const [axiome, setAxiome] = useState<Set<string>>(new Set(["WEG", "CPU"]));
  const [organe, setOrgane] = useState<Set<string>>(new Set(["VECTOR", "TERMINAL", "PAINT"]));
  const [docs, setDocs] = useState({ html: 34, txt: 21, paint: 13 });
  const [seedIdx, setSeedIdx] = useState(4);
  const [roll, setRoll] = useState(81);
  const [pipeStep, setPipeStep] = useState(2);
  const [mixVoice, setMixVoice] = useState<"man" | "woman" | "du">("du");
  const [activeGeo, setActiveGeo] = useState<GeoKind>("wuerfel");
  const [logFlash, setLogFlash] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<number, { x: number; y: number }>>({});
  const [zipState, setZipState] = useState<"idle" | "packing" | "done">("idle");
  const [saveMsg, setSaveMsg] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [burroAngle, setBurroAngle] = useState(0);
  const burro = useRef({ angle: 0, vel: 0 });
  const [geos, setGeos] = useState<GeoObj[]>([
    { id: "g1", kind: "dreieck", label: "3-ECK", x: 50, y: 16, rot: 0, scale: 1, pos: { h: 70, b: 40, t: 30 }, color: "#fbbf24" },
    { id: "g2", kind: "zylinder", label: "u.api", x: 78, y: 42, rot: 0, scale: 1, pos: { h: 40, b: 80, t: 55 }, color: "#66ccff" },
    { id: "g3", kind: "wuerfel", label: "ROLL·WÜRFEL", x: 24, y: 44, rot: 0, scale: 1, pos: { h: 55, b: 55, t: 55 }, color: "#34d399" },
    { id: "g4", kind: "atom", label: "MIX·ATOM", x: 62, y: 72, rot: 0, scale: 1, pos: { h: 33, b: 66, t: 99 }, color: "#f0f" },
    { id: "g5", kind: "pyramide", label: "PYRA", x: 34, y: 74, rot: 0, scale: 1, pos: { h: 81, b: 27, t: 9 }, color: "#f472b6" },
  ]);
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const modules = useMemo(() => buildModules(axes), [axes]);
  const totalWeight = docs.html + docs.txt + docs.paint;
  const tilt = totalWeight === 0 ? 0 : ((docs.html - docs.paint) / Math.max(1, totalWeight)) * 14;
  const completeness = useMemo(() => {
    const real = modules.filter((m) => !m.empty);
    return Math.round(real.reduce((s, m) => s + m.score, 0) / real.length);
  }, [modules]);
  const sealed = axiome.size === AXIOME.length;

  /* ---- El Burro physics: angle, vel, spring to 0, max ±26° ---- */
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const b = burro.current;
      const k = 0.045, damp = 0.92;
      b.vel += -b.angle * k;
      b.vel *= damp;
      b.angle += b.vel;
      b.angle = Math.max(-26, Math.min(26, b.angle));
      setBurroAngle(b.angle);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const schubsBurro = (dir: number) => { burro.current.vel += dir * 3.2; };

  /* ---- ROLL animation 81→27→3→0 ---- */
  const runRoll = () => {
    const seq = [81, 27, 3, 0];
    seq.forEach((v, i) => window.setTimeout(() => setRoll(v), i * 420));
    setGeos((gs) => gs.map((g) => g.kind === "wuerfel" ? { ...g, rot: g.rot + 360, scale: 0.6 } : g));
    window.setTimeout(() => setGeos((gs) => gs.map((g) => g.kind === "wuerfel" ? { ...g, scale: 1 } : g)), 1700);
  };

  /* ---- drag geometries & cards ---- */
  const onPointerDown = (e: React.PointerEvent, id: string) => {
    const el = canvasRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const cur = geos.find((g) => g.id === id);
    const card = placed[Number(id.replace("card-", ""))];
    const px = cur ? cur.x : card ? card.x : 50;
    const py = cur ? cur.y : card ? card.y : 50;
    dragRef.current = { id, dx: e.clientX - (px / 100) * r.width, dy: e.clientY - (py / 100) * r.height };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current; const el = canvasRef.current;
    if (!d || !el) return;
    const r = el.getBoundingClientRect();
    const x = Math.max(4, Math.min(96, ((e.clientX - d.dx) / r.width) * 100));
    const y = Math.max(6, Math.min(94, ((e.clientY - d.dy) / r.height) * 100));
    if (d.id.startsWith("card-")) {
      const mid = Number(d.id.replace("card-", ""));
      setPlaced((p) => ({ ...p, [mid]: { x, y } }));
    } else {
      setGeos((gs) => gs.map((g) => (g.id === d.id ? { ...g, x, y } : g)));
    }
  };
  const onPointerUp = () => { dragRef.current = null; };

  const rotateGeo = (kind: GeoKind, dir: number) =>
    setGeos((gs) => gs.map((g) => (g.kind === kind ? { ...g, rot: g.rot + dir * 45 } : g)));
  const scaleGeo = (kind: GeoKind, f: number) =>
    setGeos((gs) => gs.map((g) => (g.kind === kind ? { ...g, scale: Math.max(0.5, Math.min(1.8, g.scale * f)) } : g)));

  const focusFromLog = (entry: (typeof TOOLATOR_LOGS)[number]) => {
    setActiveGeo(entry.geo);
    setLogFlash(entry.id);
    setGeos((gs) => gs.map((g) => (g.kind === entry.geo ? { ...g, rot: g.rot + 90, scale: 1.25 } : g)));
    window.setTimeout(() => setGeos((gs) => gs.map((g) => (g.kind === entry.geo ? { ...g, scale: 1 } : g))), 600);
    if (entry.id === "roll") runRoll();
    if (entry.id === "seed") setSeedIdx((s) => Math.min(SEED_CHAIN.length - 1, s + 1));
    if (entry.id === "pipe") setPipeStep((s) => (s + 1) % 6);
    if (entry.id === "burro") schubsBurro(1);
  };

  const applyPerm = (p: (typeof PERMS)[number]) => {
    setPerm(p.key);
    const vals = { h: axes.h, b: axes.b, t: axes.t };
    const sorted = [vals.h, vals.b, vals.t].sort((a, b) => b - a);
    const next = { ...axes };
    p.order.forEach((axis, i) => { next[axis] = sorted[i]; });
    setAxes(next);
  };

  const mixMove = (voice: "man" | "woman" | "du") => {
    setMixVoice(voice);
    if (voice === "man") setAxes((a) => ({ ...a, h: Math.min(100, a.h + 12) }));
    if (voice === "woman") setAxes((a) => ({ ...a, b: Math.min(100, a.b + 12) }));
    if (voice === "du") setAxes((a) => ({ ...a, t: Math.min(100, a.t + 12) }));
    setGeos((gs) => gs.map((g) => (g.kind === "atom" ? { ...g, rot: g.rot + 120 } : g)));
  };

  const simulateZip = () => {
    setZipState("packing");
    window.setTimeout(() => setZipState("done"), 1400);
    window.setTimeout(() => setZipState("idle"), 4200);
  };

  /* ---- Records API: alpha_events + os_lastung ---- */
  const saveState = async () => {
    setBusy(true); setSaveMsg("");
    try {
      await api("records.create", {
        collection: "os_lastung",
        value: { axes, perm, weg, docs, seed: SEED_CHAIN[seedIdx], roll, pipeStep, geos: geos.map((g) => ({ id: g.id, x: Math.round(g.x), y: Math.round(g.y), rot: g.rot })) },
        idempotency_key: `os-${Date.now()}`,
      });
      await api("records.create", {
        collection: "alpha_events",
        value: { type: "SAVE", perm, seed: SEED_CHAIN[seedIdx], at: new Date().toISOString() },
        idempotency_key: `ev-${Date.now()}`,
      });
      setSaveMsg("Gespeichert in os_lastung + alpha_events ✓");
    } catch (e) {
      setSaveMsg(`API nicht erreichbar (Vorschau): ${e instanceof Error ? e.message : String(e)}`);
    } finally { setBusy(false); }
  };
  const loadState = async () => {
    setBusy(true); setSaveMsg("");
    try {
      const data = await api("records.list", { collection: "os_lastung", limit: 1 });
      const rec = (data as { records?: { value: Record<string, unknown> }[] })?.records?.[0];
      if (rec?.value) {
        const v = rec.value as { axes?: Vec3; perm?: string; docs?: typeof docs; pipeStep?: number };
        if (v.axes) setAxes(v.axes);
        if (v.perm) setPerm(v.perm);
        if (v.docs) setDocs(v.docs);
        if (typeof v.pipeStep === "number") setPipeStep(v.pipeStep);
        setSaveMsg("Letzte OS-Lastung geladen ✓");
      } else setSaveMsg("Keine gespeicherte Lastung gefunden.");
    } catch (e) {
      setSaveMsg(`API nicht erreichbar (Vorschau): ${e instanceof Error ? e.message : String(e)}`);
    } finally { setBusy(false); }
  };
  useEffect(() => { loadState(); /* eslint-disable-next-line */ }, []);

  const toggleSet = (set: Set<string>, id: string, fn: (s: Set<string>) => void) => {
    const n = new Set(set); n.has(id) ? n.delete(id) : n.add(id); fn(n);
  };

  const axisColor = { h: "#fbbf24", b: "#66ccff", t: "#f0f" };
  const axisLabel = { h: "HÖHE", b: "BREITE", t: "TIEFE" };

  return (
    <div
      data-safe-area-inset-root
      className="min-h-screen w-full overflow-x-clip"
      style={{ boxSizing: "border-box", paddingTop: "var(--safe-area-inset-top)", background: "var(--bg)", color: "var(--ink)" }}
    >
      {/* HEADER */}
      <header
        data-safe-area-sticky-top
        className="sticky z-40 border-b backdrop-blur"
        style={{ top: "var(--safe-area-inset-top)", background: "rgba(7,10,20,.92)", borderColor: "var(--line)" }}
      >
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg font-black" style={{ background: "var(--gold)", color: "#070a14" }}>9</span>
            <div>
              <div className="text-sm font-bold leading-none tracking-wide sm:text-base">REAL OS — ALLES ACHSEN BEWEGLICH</div>
              <div className="mono text-[10px]" style={{ color: "var(--muted)" }}>0 ⊃ 3 ⊃ 9 ⊃ 81 ⊃ 729 → 730 FREI · 991199 = F1FDF</div>
            </div>
          </div>
          <nav className="mono ml-auto flex flex-wrap items-center gap-1 text-[11px]">
            <a className="rounded border px-2 py-1 hover:opacity-80" style={{ borderColor: "var(--line)" }} href="https://iki1uc.github.io/3.eck/" target="_blank" rel="noopener"><Scale className="mr-1 inline h-3 w-3" />3.eck</a>
            <a className="rounded border px-2 py-1 hover:opacity-80" style={{ borderColor: "var(--line)" }} href="https://iki1uc.github.io/her.9.can/" target="_blank" rel="noopener"><Sprout className="mr-1 inline h-3 w-3" />her.9.can</a>
            <a className="rounded border px-2 py-1 hover:opacity-80" style={{ borderColor: "var(--line)" }} href="https://iki1uc.github.io/u.api.html/" target="_blank" rel="noopener"><Cpu className="mr-1 inline h-3 w-3" />u.api</a>
            <a className="rounded border px-2 py-1 hover:opacity-80" style={{ borderColor: "var(--line)" }} href="https://iki1uc.github.io/our.ctrl/" target="_blank" rel="noopener"><Layers className="mr-1 inline h-3 w-3" />our.ctrl</a>
          </nav>
          <div className="flex items-center gap-1">
            <button disabled={busy} onClick={saveState} className="mono rounded px-2 py-1 text-[11px] font-bold disabled:opacity-40" style={{ background: "var(--gold)", color: "#070a14" }}><Save className="mr-1 inline h-3 w-3" />SAVE</button>
            <button disabled={busy} onClick={loadState} className="mono rounded border px-2 py-1 text-[11px] disabled:opacity-40" style={{ borderColor: "var(--line)" }}><FolderOpen className="mr-1 inline h-3 w-3" />LOAD</button>
          </div>
        </div>
        {saveMsg && <div className="mono border-t px-3 py-1 text-[11px] sm:px-5" style={{ borderColor: "var(--line)", color: "var(--cyan)" }}>{saveMsg}</div>}
      </header>

      <main className="mx-auto grid max-w-[1600px] grid-cols-1 gap-3 px-3 py-3 sm:px-5 lg:grid-cols-[300px_minmax(0,1fr)_300px]">
        {/* ============ LEFT: TOOLATOR + BATCH + KARTOR 81 ============ */}
        <section className="flex min-w-0 flex-col gap-3">
          <div className="rounded-xl border p-3" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
            <h2 className="mono mb-2 flex items-center gap-2 text-xs font-bold" style={{ color: "var(--cyan)" }}><Terminal className="h-4 w-4" />TOOLATOR LOG <span className="font-normal" style={{ color: "var(--muted)" }}>· Klick bewegt Geometrie</span></h2>
            <ul className="space-y-1">
              {TOOLATOR_LOGS.map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => focusFromLog(l)}
                    className="mono w-full rounded border px-2 py-1.5 text-left text-[11px] leading-snug"
                    style={{
                      borderColor: logFlash === l.id ? "var(--cyan)" : "var(--line)",
                      color: "var(--cyan)", background: "var(--surface2)",
                      animation: logFlash === l.id ? "logFlash .8s" : undefined,
                    }}
                  >
                    <ChevronRight className="mr-1 inline h-3 w-3" />{l.txt}
                    <span className="float-right" style={{ color: GEO_META[l.geo].color }}>→ {GEO_META[l.geo].label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border p-3" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
            <h2 className="mono mb-2 flex items-center gap-2 text-xs font-bold" style={{ color: "var(--emerald)" }}><Package className="h-4 w-4" />BATCH CONVERT</h2>
            <ul className="mono space-y-0.5 text-[11px]" style={{ color: "var(--emerald)" }}>
              {BATCH_LOGS.map((b) => <li key={b}>▸ {b}</li>)}
            </ul>
            <button onClick={simulateZip} className="mono mt-2 w-full rounded px-2 py-2 text-[11px] font-bold" style={{ background: "var(--emerald)", color: "#04120c" }}>
              <Download className="mr-1 inline h-3 w-3" />
              {zipState === "idle" && "ZIP 2138KB · DOWNLOAD SIMULIEREN"}
              {zipState === "packing" && "PACKE 9 BILDER … 1920×1080 …"}
              {zipState === "done" && "✓ batch_9_1920x1080.zip · 2138KB (Simulation)"}
            </button>
            <div className="mono mt-2 text-[10px]" style={{ color: "var(--muted)" }}>Dr-Gewichte auf der Waage: Dr=81 · tex 60 · Q9 19683→730 FREI</div>
          </div>

          <div className="rounded-xl border p-3" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
            <h2 className="mono mb-1 flex items-center gap-2 text-xs font-bold" style={{ color: "var(--gold)" }}><MapPin className="h-4 w-4" />KARTOR · 81 DA-SEIENDE</h2>
            <div className="mono mb-2 text-[10px]" style={{ color: "var(--muted)" }}>56 echt + 15 Slots + 10 Achsen-Anker = 81 · Completeness Ø {completeness}% · Drag auf Canvas legt auf Achse</div>
            <div className="max-h-[380px] space-y-1 overflow-y-auto pr-1">
              {modules.map((m) => (
                <button
                  key={m.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/kartor", String(m.id))}
                  onClick={() => setPlaced((p) => ({ ...p, [m.id]: { x: 12 + (m.id % 5) * 18, y: 20 + (m.id % 4) * 18 } }))}
                  className="mono flex w-full items-center gap-2 rounded border px-2 py-1 text-left text-[10px]"
                  style={{ borderColor: "var(--line)", background: m.empty ? "transparent" : "var(--surface2)", opacity: m.empty ? 0.55 : 1 }}
                >
                  <span className="w-6 shrink-0 font-bold" style={{ color: "var(--gold)" }}>{String(m.id).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold" style={{ color: "var(--ink)" }}>{m.name}</span>
                    <span style={{ color: "var(--cyan)" }}>{kartorAddr(m, axes)}</span>
                  </span>
                  <span className="shrink-0" style={{ color: m.score >= 80 ? "var(--emerald)" : m.score >= 55 ? "var(--gold)" : "var(--muted)" }}>{m.empty ? "—" : `${m.score}%`}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CENTER: CANVAS ============ */}
        <section className="flex min-w-0 flex-col gap-3">
          <div
            ref={canvasRef}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const id = Number(e.dataTransfer.getData("text/kartor"));
              const r = canvasRef.current?.getBoundingClientRect(); if (!r || !id) return;
              setPlaced((p) => ({ ...p, [id]: { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 } }));
            }}
            className="relative h-[430px] overflow-hidden rounded-xl border sm:h-[520px]"
            style={{ background: "radial-gradient(circle at 50% 50%, #101a36 0%, #070a14 65%)", borderColor: "var(--line)" }}
          >
            {/* Achsen-Kreuz */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-0" style={{ transform: "translate(-50%,-50%)" }}>
              <div style={{ width: `${axes.b * 3.4}px`, height: 2, background: axisColor.b, transform: "translateX(-50%)", opacity: .8 }} />
              <div style={{ width: 2, height: `${axes.h * 3.4}px`, background: axisColor.h, transform: "translate(-50%,-50%)", position: "absolute", left: "50%", top: "50%", opacity: .8 }} />
              <div style={{ width: `${axes.t * 3.4}px`, height: 2, background: axisColor.t, transform: `translate(-50%,-50%) rotate(-32deg)`, position: "absolute", left: "50%", top: "50%", opacity: .8 }} />
              <div className="mono absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 text-center text-[9px] font-bold" style={{ borderColor: "var(--gold)", background: "#070a14", color: "var(--gold)" }}>
                u.api<br />{perm}
              </div>
              <span className="mono absolute text-[10px] font-bold" style={{ color: axisColor.h, top: `-${axes.h * 1.7 + 16}px`, left: 6 }}>H {axes.h}</span>
              <span className="mono absolute text-[10px] font-bold" style={{ color: axisColor.b, left: `${axes.b * 1.7 + 8}px`, top: -8 }}>B {axes.b}</span>
              <span className="mono absolute text-[10px] font-bold" style={{ color: axisColor.t, left: `${axes.t * 1.2}px`, top: `${axes.t * 0.9}px` }}>T {axes.t}</span>
            </div>

            {/* Geometrien */}
            {geos.map((g) => {
              const M = GEO_META[g.kind];
              const active = activeGeo === g.kind;
              return (
                <div
                  key={g.id}
                  onPointerDown={(e) => { onPointerDown(e, g.id); setActiveGeo(g.kind); }}
                  className="geo-grab absolute z-10 select-none"
                  style={{ left: `${g.x}%`, top: `${g.y}%`, transform: `translate(-50%,-50%) rotate(${g.rot}deg) scale(${g.scale})` }}
                >
                  <div className="flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-2 text-center"
                    style={{ borderColor: M.color, background: "rgba(7,10,20,.85)", boxShadow: active ? `0 0 18px ${M.color}66` : undefined, animation: active ? "pulseGold 1.6s infinite" : undefined }}>
                    <M.Icon className="h-8 w-8" style={{ color: M.color }} />
                    <div className="mono text-[9px] font-bold" style={{ color: M.color }}>{M.label}</div>
                    <div className="mono text-[8px]" style={{ color: "var(--muted)" }}>{g.label} · H{g.pos.h} B{g.pos.b} T{g.pos.t}</div>
                  </div>
                </div>
              );
            })}

            {/* Platzierte KARTOR-Karten aus der Liste */}
            {Object.entries(placed).map(([id, p]) => {
              const m = modules[Number(id) - 1]; if (!m) return null;
              return (
                <div key={id}
                  onPointerDown={(e) => onPointerDown(e, `card-${id}`)}
                  className="geo-grab mono absolute z-10 max-w-[130px] rounded border px-1.5 py-1 text-[8px] leading-tight"
                  style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)", borderColor: "var(--gold)", background: "rgba(7,10,20,.9)", color: "var(--ink)" }}>
                  <b style={{ color: "var(--gold)" }}>{m.name}</b><br />
                  <span style={{ color: "var(--cyan)" }}>{kartorAddr(m, axes)}</span>
                  <button className="ml-1 inline" aria-label="Karte entfernen" onClick={(e) => { e.stopPropagation(); setPlaced((pp) => { const n = { ...pp }; delete n[Number(id)]; return n; }); }}><X className="inline h-3 w-3" /></button>
                </div>
              );
            })}

            {/* El Burro */}
            <div className="absolute bottom-3 right-3 z-20 flex flex-col items-center">
              <div style={{ transform: `rotate(${burroAngle}deg)`, transformOrigin: "50% 90%" }} className="text-4xl" role="img" aria-label="El Burro Stehauf-Esel">🫏</div>
              <div className="mono mt-1 text-center text-[9px]" style={{ color: "var(--muted)" }}>EL BURRO · {burroAngle.toFixed(1)}° / ±26°<br />f(f(x))=f(x)</div>
              <div className="mt-1 flex gap-1">
                <button onClick={() => schubsBurro(-1)} className="mono rounded border px-2 py-0.5 text-[10px]" style={{ borderColor: "var(--line)" }}>◀ SCHUBS</button>
                <button onClick={() => schubsBurro(1)} className="mono rounded border px-2 py-0.5 text-[10px]" style={{ borderColor: "var(--line)" }}>SCHUBS ▶</button>
              </div>
            </div>

            <div className="mono pointer-events-none absolute left-3 top-3 z-10 text-[10px]" style={{ color: "var(--muted)" }}>
              CANVAS · alles dragbar · Klick auf Geometrie = Fokus · ROLL-Wert: <b style={{ color: "var(--emerald)" }}>{roll}</b>
            </div>
          </div>

          {/* Geometrie-Steuerung */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border p-2" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
            <span className="mono text-[10px] font-bold" style={{ color: "var(--muted)" }}>GEOMETRIE:</span>
            {(Object.keys(GEO_META) as GeoKind[]).map((k) => (
              <button key={k} onClick={() => setActiveGeo(k)} className="mono rounded border px-2 py-1 text-[10px] font-bold"
                style={{ borderColor: GEO_META[k].color, color: GEO_META[k].color, background: activeGeo === k ? "var(--surface2)" : "transparent" }}>
                {GEO_META[k].label}
              </button>
            ))}
            <div className="ml-auto flex gap-1">
              <button onClick={() => rotateGeo(activeGeo, -1)} className="mono rounded border px-2 py-1 text-[10px]" style={{ borderColor: "var(--line)" }}><RotateCcw className="inline h-3 w-3" /> −45°</button>
              <button onClick={() => rotateGeo(activeGeo, 1)} className="mono rounded border px-2 py-1 text-[10px]" style={{ borderColor: "var(--line)" }}>+45°</button>
              <button onClick={() => scaleGeo(activeGeo, 0.85)} className="mono rounded border px-2 py-1 text-[10px]" style={{ borderColor: "var(--line)" }}>−</button>
              <button onClick={() => scaleGeo(activeGeo, 1.18)} className="mono rounded border px-2 py-1 text-[10px]" style={{ borderColor: "var(--line)" }}>+</button>
            </div>
          </div>

          {/* 9 Bilder Grid 3x3 */}
          <div className="rounded-xl border p-3" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
            <h3 className="mono mb-2 flex items-center gap-2 text-xs font-bold" style={{ color: "var(--ink)" }}><Grid3x3 className="h-4 w-4" style={{ color: "var(--gold)" }} />BATCH · 9 BILDER 3×3 · 1920×1080 · LS_City_Desert</h3>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }, (_, i) => {
                const hues = [222, 199, 160, 280, 330, 45, 190, 120, 20];
                return (
                  <button key={i}
                    onClick={() => setPlaced((p) => ({ ...p, [56 + i]: { x: 15 + (i % 3) * 30, y: 18 + Math.floor(i / 3) * 26 } }))}
                    className="group relative aspect-video overflow-hidden rounded-lg border text-left"
                    style={{ borderColor: "var(--line)", background: `linear-gradient(135deg, hsl(${hues[i]} 70% 26%), hsl(${hues[i] + 40} 80% 12%))` }}>
                    <span className="mono absolute left-1.5 top-1 text-[9px] font-bold text-white/90">IMG {i + 1}/9</span>
                    <span className="mono absolute bottom-1 left-1.5 text-[8px] text-white/70">{i % 2 ? "Desert" : "City"} · Dr {9 + i * 9}</span>
                    <span className="mono absolute bottom-1 right-1.5 text-[8px] font-bold" style={{ color: "var(--gold)" }}>→ ACHSE</span>
                  </button>
                );
              })}
            </div>
            <div className="mono mt-2 text-[10px]" style={{ color: "var(--muted)" }}>Klick auf ein Bild legt es als Karte auf die Achsen. Widgets: 1651 · 860 · 400 · 1302 · 232.</div>
          </div>
        </section>

        {/* ============ RIGHT: WAAGE + WEGE + AXIOME + ORGANE ============ */}
        <section className="flex min-w-0 flex-col gap-3">
          <div className="rounded-xl border p-3" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
            <h2 className="mono mb-2 flex items-center gap-2 text-xs font-bold" style={{ color: "var(--gold)" }}><Scale className="h-4 w-4" />3-ECK · WAAGNISSCHALE</h2>
            <div className="relative mx-auto mb-1 h-24 max-w-[240px]">
              <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2" style={{ background: "var(--line)" }} />
              <div className="absolute left-0 right-0 top-4 h-1 rounded" style={{ background: "var(--gold)", transform: `rotate(${tilt}deg)`, transition: "transform .5s" }} />
              <div className="mono absolute left-0 top-8 text-center text-[9px]" style={{ color: "#fbbf24" }}>HTML<br /><b className="text-sm">{docs.html}</b></div>
              <div className="mono absolute right-0 top-8 text-center text-[9px]" style={{ color: "#f472b6" }}>PAINT<br /><b className="text-sm">{docs.paint}</b></div>
              <div className="mono absolute bottom-0 left-1/2 -translate-x-1/2 text-center text-[9px]" style={{ color: "#66ccff" }}>TXT · {docs.txt} · Σ {totalWeight}</div>
            </div>
            {(["html", "txt", "paint"] as const).map((k) => (
              <label key={k} className="mono mb-1 block text-[10px]" style={{ color: "var(--muted)" }}>
                {k.toUpperCase()} Gewicht · {docs[k]}
                <input type="range" min={0} max={100} value={docs[k]} onChange={(e) => setDocs((d) => ({ ...d, [k]: Number(e.target.value) }))} className="w-full" />
              </label>
            ))}
            <div className="mono text-[10px]" style={{ color: "var(--muted)" }}>Dr=81 liegt als Batch-Gewicht mit auf der Schale. NEUGEBUNG = Summe aller drei Ecken als ein Dokument.</div>
          </div>

          <div className="rounded-xl border p-3" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
            <h2 className="mono mb-2 flex items-center gap-2 text-xs font-bold" style={{ color: "var(--ink)" }}><Route className="h-4 w-4" style={{ color: "var(--gold)" }} />5 WEGE</h2>
            <div className="space-y-1">
              {WEGE.map((w) => (
                <button key={w.id} onClick={() => setWeg(w.id)} className="mono flex w-full items-center justify-between rounded border px-2 py-1.5 text-[11px]"
                  style={{ borderColor: weg === w.id ? w.color : "var(--line)", color: weg === w.id ? w.color : "var(--ink)", background: weg === w.id ? "var(--surface2)" : "transparent" }}>
                  <span className="font-bold">{w.label}</span><span style={{ color: "var(--muted)" }}>{w.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-3" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
            <h2 className="mono mb-2 flex items-center gap-2 text-xs font-bold" style={{ color: "var(--ink)" }}><ShieldCheck className="h-4 w-4" style={{ color: "var(--gold)" }} />8 AXIOME {sealed && <span style={{ color: "var(--gold)" }}>· PRISMATIC SEAL ⚡ Σ2268→4TEL 567</span>}</h2>
            <div className="flex flex-wrap gap-1">
              {AXIOME.map((a) => (
                <button key={a.id} onClick={() => toggleSet(axiome, a.id, setAxiome)} className="mono rounded-full border px-2 py-1 text-[10px] font-bold"
                  style={{ borderColor: axiome.has(a.id) ? "var(--gold)" : "var(--line)", color: axiome.has(a.id) ? "#070a14" : "var(--muted)", background: axiome.has(a.id) ? "var(--gold)" : "transparent" }}>
                  {a.id} <span className="opacity-60">{a.grp}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-3" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
            <h2 className="mono mb-2 flex items-center gap-2 text-xs font-bold" style={{ color: "var(--ink)" }}><Eye className="h-4 w-4" style={{ color: "var(--gold)" }} />13 ORGANE</h2>
            <div className="flex flex-wrap gap-1">
              {ORGANE.map((o) => (
                <button key={o} onClick={() => toggleSet(organe, o, setOrgane)} className="mono rounded border px-2 py-1 text-[10px]"
                  style={{ borderColor: organe.has(o) ? "var(--cyan)" : "var(--line)", color: organe.has(o) ? "var(--cyan)" : "var(--muted)", background: organe.has(o) ? "var(--surface2)" : "transparent" }}>
                  {o}
                </button>
              ))}
            </div>
            <div className="mono mt-2 text-[10px]" style={{ color: "var(--muted)" }}>{organe.size}/13 Organe offen · Weg: {WEGE.find((w) => w.id === weg)?.label}</div>
          </div>

          <div className="rounded-xl border p-3" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
            <h2 className="mono mb-2 flex items-center gap-2 text-xs font-bold" style={{ color: "#f0f" }}><Users className="h-4 w-4" />MIX · 3 STIMMEN</h2>
            <div className="grid grid-cols-3 gap-1">
              {(["man", "woman", "du"] as const).map((v) => (
                <button key={v} onClick={() => mixMove(v)} className="mono rounded border px-2 py-2 text-[11px] font-bold"
                  style={{ borderColor: mixVoice === v ? "#f0f" : "var(--line)", color: mixVoice === v ? "#f0f" : "var(--ink)", background: mixVoice === v ? "var(--surface2)" : "transparent" }}>
                  {v}<br /><span className="text-[8px] font-normal" style={{ color: "var(--muted)" }}>{v === "man" ? "+HÖHE" : v === "woman" ? "+BREITE" : "+TIEFE"}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ============ BOTTOM BAR ============ */}
      <footer className="mx-auto max-w-[1600px] px-3 pb-5 sm:px-5">
        <div className="grid grid-cols-1 gap-3 rounded-xl border p-3 md:grid-cols-2 xl:grid-cols-4" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
          <div>
            <div className="mono mb-1 text-[10px] font-bold" style={{ color: "var(--muted)" }}>H/B/T · 6 PERMUTATIONEN</div>
            <div className="flex flex-wrap gap-1">
              {PERMS.map((p) => (
                <button key={p.key} onClick={() => applyPerm(p)} className="mono rounded border px-2 py-1 text-[11px] font-bold"
                  style={{ borderColor: perm === p.key ? "var(--gold)" : "var(--line)", color: perm === p.key ? "#070a14" : "var(--ink)", background: perm === p.key ? "var(--gold)" : "transparent" }}>
                  {p.label}
                </button>
              ))}
            </div>
            {(["h", "b", "t"] as const).map((a) => (
              <label key={a} className="mono mt-1 block text-[10px]" style={{ color: axisColor[a] }}>
                {axisLabel[a]} {axes[a]}
                <input type="range" min={0} max={100} value={axes[a]} onChange={(e) => setAxes((s) => ({ ...s, [a]: Number(e.target.value) }))} className="w-full" />
              </label>
            ))}
          </div>

          <div>
            <div className="mono mb-1 flex items-center gap-1 text-[10px] font-bold" style={{ color: "var(--muted)" }}><SeedIcon className="h-3 w-3" />SEED · 0⊃3⊃9⊃27⊃81⊃243⊃729→730 FREI</div>
            <div className="mono mb-1 text-2xl font-black" style={{ color: "var(--gold)" }}>{SEED_CHAIN[seedIdx]}{seedIdx === SEED_CHAIN.length - 1 && <span className="ml-2 text-xs">FREI</span>}</div>
            <input type="range" min={0} max={SEED_CHAIN.length - 1} value={seedIdx} onChange={(e) => setSeedIdx(Number(e.target.value))} className="w-full" />
            <div className="mono flex justify-between text-[8px]" style={{ color: "var(--muted)" }}>{SEED_CHAIN.map((s) => <span key={s}>{s}</span>)}</div>
            <div className="mt-1 flex gap-1 overflow-hidden rounded" style={{ height: 8 }}>
              {SEED_CHAIN.slice(1).map((s, i) => (
                <div key={s} style={{ flex: 1, background: i < seedIdx ? "var(--gold)" : "var(--surface2)", transformOrigin: "bottom", animation: "seedGrow .4s" }} />
              ))}
            </div>
          </div>

          <div>
            <div className="mono mb-1 flex items-center gap-1 text-[10px] font-bold" style={{ color: "var(--muted)" }}><Dices className="h-3 w-3" />ROLL · 81→27→3→0 KOLLAPS</div>
            <div className="mono mb-1 text-2xl font-black" style={{ color: "var(--emerald)" }}>{roll}</div>
            <input type="range" min={0} max={81} value={roll} onChange={(e) => setRoll(Number(e.target.value))} className="w-full" />
            <button onClick={runRoll} className="mono mt-1 w-full rounded px-2 py-1.5 text-[11px] font-bold" style={{ background: "var(--emerald)", color: "#04120c" }}>
              <Play className="mr-1 inline h-3 w-3" />ROLL ANIMIEREN · Würfel dreht
            </button>
          </div>

          <div>
            <div className="mono mb-1 flex items-center gap-1 text-[10px] font-bold" style={{ color: "var(--muted)" }}><Activity className="h-3 w-3" />PIPELINE · P0→Pe</div>
            <div className="flex gap-1">
              {["P0", "P1", "P2", "P3", "P4", "Pe"].map((s, i) => (
                <button key={s} onClick={() => setPipeStep(i)} className="mono flex-1 rounded border px-1 py-1.5 text-[10px] font-bold"
                  style={{ borderColor: i <= pipeStep ? "var(--emerald)" : "var(--line)", color: i <= pipeStep ? "#04120c" : "var(--muted)", background: i <= pipeStep ? "var(--emerald)" : "transparent" }}>
                  {s}
                </button>
              ))}
            </div>
            <div className="mono mt-2 text-[10px]" style={{ color: "var(--muted)" }}>
              <Gauge className="mr-1 inline h-3 w-3" />Stufe {pipeStep}/5 · KARTOR-Adresse der Mitte: <span style={{ color: "var(--cyan)" }}>{LEVELS[seedIdx % LEVELS.length]}.{FLOWS[pipeStep % 4]}.ZEN.{String(Math.round((axes.h + axes.b + axes.t) / 3)).padStart(2, "0")}</span>
            </div>
            <div className="mono mt-1 text-[10px]" style={{ color: "var(--muted)" }}>Q702-tauglich · 8–12W · offline · eine Datei · f.rom W(a(s(d)))</div>
          </div>
        </div>
        <div className="mono mt-3 text-center text-[10px]" style={{ color: "var(--muted)" }}>
          REAL OS · 3-Eck × her.9.can × u.api × our.ctrl × TOOLATOR × BATCH × KARTOR · Alles Achsen beweglich · 0 ⊃ 3 ⊃ 9 ⊃ 81 ⊃ 729 → 730 FREI
        </div>
      </footer>
    </div>
  );
}
