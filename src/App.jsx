import React, { useState, useEffect, useMemo, useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Settings2,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Sparkles,
  Wallet,
  TrendingUp,
} from "lucide-react";

const STORAGE_KEY = "rebalanceo-dca:config:v1";

// Paleta neón — un color vivo y distinguible por activo
const PALETTE = [
  "#00F0FF", // cian
  "#FF2E9A", // magenta
  "#7B2FFF", // violeta
  "#C6FF3D", // lima
  "#FFB800", // ámbar
  "#00FFA3", // verde menta neón
  "#FF5C5C", // coral
  "#3D9CFF", // azul eléctrico
  "#FF8A00", // naranja
  "#B967FF", // orquídea
];

const DEFAULT_ASSETS = [
  { id: "msci-world", name: "MSCI World", target: 45 },
  { id: "msci-em", name: "MSCI Emerging Markets", target: 10 },
  { id: "msci-small", name: "MSCI Small Caps", target: 10 },
  { id: "cameco", name: "Cameco", target: 6 },
  { id: "copper", name: "Copper Miners", target: 6 },
  { id: "uhg", name: "UHG", target: 6 },
  { id: "gold", name: "Physical Gold", target: 5 },
  { id: "asml", name: "ASML", target: 5 },
  { id: "btc", name: "Bitcoin", target: 5 },
  { id: "ionq", name: "IonQ", target: 2 },
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function formatEUR(n) {
  if (!isFinite(n)) return "—";
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

export default function App() {
  const [assets, setAssets] = useState(DEFAULT_ASSETS);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [dca, setDca] = useState("");
  const [totalValue, setTotalValue] = useState("");
  const [saveState, setSaveState] = useState("idle");
  const saveTimeout = useRef(null);

  // Cargar configuración guardada en este navegador
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) setAssets(parsed);
      }
    } catch (e) {
      /* sin configuración previa */
    } finally {
      setLoaded(true);
    }
  }, []);

  // Guardar cambios de configuración automáticamente
  useEffect(() => {
    if (!loaded) return;
    setSaveState("saving");
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
      setSaveState("saved");
    }, 400);
    return () => clearTimeout(saveTimeout.current);
  }, [assets, loaded]);

  const targetSum = useMemo(
    () => assets.reduce((s, a) => s + (Number(a.target) || 0), 0),
    [assets]
  );

  const dcaNum = Number(String(dca).replace(",", ".")) || 0;
  const totalNum = Number(String(totalValue).replace(",", ".")) || 0;

  const rows = useMemo(() => {
    if (!dcaNum || targetSum <= 0) return [];
    const newTotal = totalNum + dcaNum;
    return assets.map((a, i) => {
      const pct = (Number(a.target) || 0) / targetSum;
      const current = totalNum * pct;
      const ideal = newTotal * pct;
      const invest = ideal - current;
      return { ...a, color: PALETTE[i % PALETTE.length], pct, current, ideal, invest };
    });
  }, [assets, dcaNum, totalNum, targetSum]);

  const canCalculate = dcaNum > 0 && targetSum > 0;

  function updateAsset(id, field, value) {
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  }
  function addAsset() {
    setAssets((prev) => [...prev, { id: uid(), name: "", target: 0 }]);
  }
  function removeAsset(id) {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#05050F] text-white font-sans selection:bg-cyan-400/20">
      {/* Fondo: malla de degradados flotantes */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,_rgba(0,240,255,0.35)_0%,_transparent_70%)] blur-3xl animate-floatA" />
        <div className="absolute top-1/3 -right-40 w-[560px] h-[560px] rounded-full bg-[radial-gradient(circle,_rgba(255,46,154,0.3)_0%,_transparent_70%)] blur-3xl animate-floatB" />
        <div className="absolute bottom-[-200px] left-1/4 w-[480px] h-[480px] rounded-full bg-[radial-gradient(circle,_rgba(123,47,255,0.3)_0%,_transparent_70%)] blur-3xl animate-floatA" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,15,0)_0%,rgba(5,5,15,0.6)_70%,rgba(5,5,15,1)_100%)]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        {/* Encabezado */}
        <header className="flex items-start justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-cyan-300" />
              <p className="text-[11px] tracking-[0.22em] uppercase text-cyan-300/90 font-semibold">
                Rebalanceo · DCA Engine
              </p>
            </div>
            <h1 className="font-display text-[30px] sm:text-[38px] font-semibold leading-[1.05] text-gradient">
              Tu aportación
              <br />
              de este mes
            </h1>
          </div>
          <button
            onClick={() => setEditing((v) => !v)}
            className="tap shrink-0 mt-2 flex items-center gap-1.5 text-[12.5px] font-medium text-white/70 hover:text-white glass rounded-full px-3.5 py-2"
          >
            <Settings2 size={14} />
            {editing ? "Listo" : "Configurar"}
          </button>
        </header>

        {/* Configuración */}
        {editing && (
          <section className="mb-8 rounded-3xl glass-strong neon-ring p-5 sm:p-6 animate-[fadeIn_.2s_ease]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[12.5px] font-semibold uppercase tracking-wide text-white/50">
                Activos y % objetivo
              </h2>
              <span
                className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${
                  targetSum === 100
                    ? "text-[#00FFA3] bg-[#00FFA3]/10"
                    : "text-[#FFB800] bg-[#FFB800]/10"
                }`}
              >
                Suma: {targetSum}%
              </span>
            </div>

            <div className="space-y-2.5">
              {assets.map((a, i) => (
                <div key={a.id} className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: PALETTE[i % PALETTE.length], boxShadow: `0 0 10px ${PALETTE[i % PALETTE.length]}` }}
                  />
                  <input
                    value={a.name}
                    onChange={(e) => updateAsset(a.id, "name", e.target.value)}
                    placeholder="Nombre del activo"
                    className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 placeholder:text-white/25 transition-colors"
                  />
                  <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 w-[88px] focus-within:border-cyan-400/50">
                    <input
                      type="number"
                      value={a.target}
                      onChange={(e) =>
                        updateAsset(a.id, "target", e.target.value === "" ? "" : Number(e.target.value))
                      }
                      className="w-full bg-transparent text-[14px] outline-none text-right"
                    />
                    <span className="text-[13px] text-white/30">%</span>
                  </div>
                  <button
                    onClick={() => removeAsset(a.id)}
                    className="tap text-white/30 hover:text-[#FF5C5C] p-1.5"
                    aria-label="Eliminar activo"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addAsset}
              className="tap mt-4 flex items-center gap-1.5 text-[13px] font-medium text-cyan-300 hover:text-cyan-200"
            >
              <Plus size={15} /> Añadir activo
            </button>

            {targetSum !== 100 && (
              <p className="mt-4 flex items-start gap-1.5 text-[12.5px] text-[#FFB800]">
                <AlertCircle size={14} className="shrink-0 mt-[1px]" />
                Los porcentajes suman {targetSum}%, no 100%. Se normalizarán automáticamente al calcular.
              </p>
            )}

            <p className="mt-3 flex items-center gap-1.5 text-[12px] text-[#00FFA3]">
              <Check size={13} /> Se guarda solo en este navegador — no hace falta repetirlo cada mes.
            </p>
          </section>
        )}

        {/* Inputs mensuales */}
        <section className="mb-8 grid grid-cols-2 gap-3">
          <div className="group rounded-3xl glass p-4 sm:p-5 transition-all focus-within:neon-ring">
            <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/40 font-medium mb-2.5">
              <Wallet size={12} /> Aportación DCA
            </label>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-[20px] text-white/30">€</span>
              <input
                type="number"
                inputMode="decimal"
                value={dca}
                onChange={(e) => setDca(e.target.value)}
                placeholder="1000"
                className="w-full bg-transparent font-display text-[30px] font-semibold outline-none placeholder:text-white/15 text-gradient-lime"
              />
            </div>
          </div>
          <div className="group rounded-3xl glass p-4 sm:p-5 transition-all focus-within:neon-ring">
            <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/40 font-medium mb-2.5">
              <TrendingUp size={12} /> Valor total cartera
            </label>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-[20px] text-white/30">€</span>
              <input
                type="number"
                inputMode="decimal"
                value={totalValue}
                onChange={(e) => setTotalValue(e.target.value)}
                placeholder="17905"
                className="w-full bg-transparent font-display text-[30px] font-semibold outline-none placeholder:text-white/15 text-white"
              />
            </div>
          </div>
        </section>

        {/* Resultado */}
        {!canCalculate ? (
          <div className="rounded-3xl border border-dashed border-white/10 py-16 text-center">
            <p className="text-[14px] text-white/30">
              Introduce la aportación y el valor de tu cartera para ver dónde invertir.
            </p>
          </div>
        ) : (
          <section className="grid sm:grid-cols-[210px_1fr] gap-6 items-center">
            {/* Donut neón */}
            <div className="relative w-[210px] h-[210px] mx-auto sm:mx-0">
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,_rgba(0,240,255,0.18)_0%,_transparent_70%)] blur-xl" />
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {rows.map((r) => (
                      <filter key={`glow-${r.id}`} id={`glow-${r.id}`} x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={r.color} floodOpacity="0.85" />
                      </filter>
                    ))}
                  </defs>
                  <Pie
                    data={rows}
                    dataKey="invest"
                    nameKey="name"
                    innerRadius={68}
                    outerRadius={96}
                    paddingAngle={4}
                    stroke="none"
                    isAnimationActive
                    animationDuration={600}
                  >
                    {rows.map((r) => (
                      <Cell key={r.id} fill={r.color} filter={`url(#glow-${r.id})`} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, n) => [formatEUR(v), n]}
                    contentStyle={{
                      background: "rgba(10,10,20,0.9)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "12px",
                      fontSize: "12.5px",
                      backdropFilter: "blur(10px)",
                    }}
                    itemStyle={{ color: "#fff" }}
                    labelStyle={{ display: "none" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-display text-[22px] font-semibold leading-none text-gradient">
                  {formatEUR(dcaNum)}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-white/35 mt-1.5">este mes</span>
              </div>
            </div>

            {/* Tabla de instrucciones */}
            <div className="rounded-3xl glass overflow-hidden">
              <div className="px-4 sm:px-5 py-3.5 border-b border-white/10">
                <h2 className="text-[12.5px] font-semibold uppercase tracking-wide text-white/45">
                  Invierte así este mes
                </h2>
              </div>
              <div>
                {rows.map((r) => (
                  <div
                    key={r.id}
                    className="tap flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-white/[0.06] last:border-b-0 hover:bg-white/[0.03] cursor-default"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: r.color, boxShadow: `0 0 8px ${r.color}` }}
                      />
                      <span className="text-[14px] font-medium truncate">{r.name || "Sin nombre"}</span>
                      <span className="text-[11px] text-white/35 shrink-0">{Math.round(r.pct * 100)}%</span>
                    </div>
                    <span
                      className={`font-display text-[17px] font-semibold shrink-0 ml-3 ${
                        r.invest < 0 ? "text-[#FF5C5C]" : "text-white"
                      }`}
                    >
                      {formatEUR(r.invest)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="px-4 sm:px-5 py-3 bg-white/[0.02] flex items-center justify-between">
                <span className="text-[12.5px] text-white/40">Nueva cartera total</span>
                <span className="font-display text-[15px] font-medium text-white/70">
                  {formatEUR(totalNum + dcaNum)}
                </span>
              </div>
            </div>
          </section>
        )}

        {canCalculate && rows.some((r) => r.invest < 0) && (
          <p className="mt-4 flex items-start gap-1.5 text-[12.5px] text-[#FF5C5C]">
            <AlertCircle size={14} className="shrink-0 mt-[1px]" />
            Algún activo está por encima de su peso objetivo: tendría aportación negativa. Repártela
            proporcionalmente entre el resto o ignórala este mes.
          </p>
        )}

        <footer className="mt-10 flex items-center justify-between text-[11px] text-white/25">
          <span>Cálculo: % objetivo aplicado sobre el total tras la aportación.</span>
          <span className="flex items-center gap-1">
            {saveState === "saving" ? "Guardando…" : saveState === "saved" ? (
              <>
                <Check size={12} /> Guardado
              </>
            ) : ""}
          </span>
        </footer>
      </div>
    </div>
  );
}
