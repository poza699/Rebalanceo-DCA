import React, { useState, useEffect, useMemo, useRef } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  Settings2,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Sparkles,
  Wallet,
  Zap,
  PieChart as PieChartIcon,
} from "lucide-react";

const STORAGE_KEY = "rebalanceo-dca:config:v2";

const PALETTE = [
  "#00F0FF",
  "#FF2E9A",
  "#7B2FFF",
  "#C6FF3D",
  "#FFB800",
  "#00FFA3",
  "#FF5C5C",
  "#3D9CFF",
  "#FF8A00",
  "#B967FF",
];

const DEFAULT_ASSETS = [
  { id: "msci-world", name: "MSCI World", target: 45, invested: 8315 },
  { id: "msci-em", name: "MSCI Emerging Markets", target: 10, invested: 2890 },
  { id: "msci-small", name: "MSCI Small Caps", target: 10, invested: 1850 },
  { id: "cameco", name: "Cameco", target: 6, invested: 600 },
  { id: "copper", name: "Copper Miners", target: 6, invested: 1000 },
  { id: "uhg", name: "UHG", target: 6, invested: 850 },
  { id: "gold", name: "Physical Gold", target: 5, invested: 445 },
  { id: "asml", name: "ASML", target: 5, invested: 715 },
  { id: "btc", name: "Bitcoin", target: 5, invested: 770 },
  { id: "ionq", name: "IonQ", target: 2, invested: 470 },
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function formatEUR(n) {
  if (!isFinite(n)) return "—";
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

const CSS = `
  * { box-sizing: border-box; }
  .rdca-root {
    position: relative;
    min-height: 100vh;
    width: 100%;
    background: #05050f;
    color: #ffffff;
    font-family: 'Inter', sans-serif;
    overflow-x: hidden;
  }
  .rdca-bg { position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
  .rdca-blob { position: absolute; border-radius: 50%; filter: blur(60px); }
  .blob-1 { top: -160px; left: -130px; width: 520px; height: 520px; background: radial-gradient(circle, rgba(0,240,255,0.35) 0%, transparent 70%); animation: floatA 14s ease-in-out infinite; }
  .blob-2 { top: 32%; right: -160px; width: 560px; height: 560px; background: radial-gradient(circle, rgba(255,46,154,0.30) 0%, transparent 70%); animation: floatB 18s ease-in-out infinite; }
  .blob-3 { bottom: -200px; left: 22%; width: 480px; height: 480px; background: radial-gradient(circle, rgba(123,47,255,0.30) 0%, transparent 70%); animation: floatA 16s ease-in-out infinite; }
  .rdca-vignette { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(5,5,15,0) 0%, rgba(5,5,15,0.6) 70%, rgba(5,5,15,1) 100%); }
  @keyframes floatA { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,-30px) scale(1.08); } }
  @keyframes floatB { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-50px,40px) scale(1.05); } }
  @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 24px 0 rgba(0,240,255,0.45), 0 0 50px 4px rgba(123,47,255,0.30); } 50% { box-shadow: 0 0 38px 4px rgba(0,240,255,0.65), 0 0 70px 10px rgba(255,46,154,0.35); } }

  .rdca-wrap { position: relative; z-index: 1; max-width: 720px; margin: 0 auto; padding: 40px 20px 56px; }
  @media (min-width: 640px) { .rdca-wrap { padding: 56px 32px 64px; } }

  .rdca-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 36px; gap: 12px; }
  .rdca-eyebrow { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: #67e8f9; }
  .rdca-eyebrow span { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; font-weight: 600; }
  .rdca-title {
    font-family: 'Space Grotesk', sans-serif; font-size: 30px; font-weight: 600; line-height: 1.08; margin: 0;
    background-image: linear-gradient(90deg, #00f0ff 0%, #7b2fff 50%, #ff2e9a 100%);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  @media (min-width: 640px) { .rdca-title { font-size: 38px; } }

  .rdca-btn-ghost {
    flex-shrink: 0; margin-top: 4px; display: flex; align-items: center; gap: 6px;
    font-size: 12.5px; font-weight: 500; color: rgba(255,255,255,0.7);
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(20px) saturate(160%);
    border-radius: 999px; padding: 8px 14px; cursor: pointer;
    transition: transform 120ms cubic-bezier(.34,1.56,.64,1), filter 150ms ease, color 150ms ease;
  }
  .rdca-btn-ghost:hover { color: #fff; }
  .rdca-btn-ghost:active { transform: scale(0.95); filter: brightness(1.15); }

  .rdca-panel {
    border-radius: 24px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
    backdrop-filter: blur(28px) saturate(180%);
    box-shadow: 0 0 0 1px rgba(0,240,255,0.18), 0 0 24px -4px rgba(123,47,255,0.45), 0 8px 30px -8px rgba(0,0,0,0.6);
    padding: 22px; margin-bottom: 28px;
  }
  @media (min-width: 640px) { .rdca-panel { padding: 26px; } }

  .rdca-panel-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
  .rdca-panel-label { font-size: 12.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: rgba(255,255,255,0.5); }
  .rdca-pill { font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 999px; }
  .pill-ok { color: #00ffa3; background: rgba(0,255,163,0.12); }
  .pill-warn { color: #ffb800; background: rgba(255,184,0,0.12); }

  .rdca-row {
    display: flex; flex-direction: column; gap: 8px;
    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px; padding: 12px; margin-bottom: 10px;
  }
  .rdca-row-top { display: flex; align-items: center; gap: 8px; }
  .rdca-row-bottom { display: flex; align-items: center; gap: 8px; padding-left: 18px; }
  .rdca-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .rdca-input-name {
    flex: 1 1 auto; min-width: 0; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px; padding: 10px 12px; font-size: 14px; color: #fff; outline: none;
  }
  .rdca-input-name::placeholder { color: rgba(255,255,255,0.25); }
  .rdca-input-name:focus { border-color: rgba(34,211,238,0.5); }
  .rdca-field-group { flex: 1; display: flex; flex-direction: column; gap: 4px; }
  .rdca-field-group label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255,255,255,0.3); }

  .rdca-eur-box {
    display: flex; align-items: center; gap: 3px; background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 10px 10px; flex: 1;
  }
  .rdca-eur-box span { font-size: 12.5px; color: rgba(255,255,255,0.3); }
  .rdca-eur-box input { width: 100%; background: transparent; border: none; outline: none; color: #fff; font-size: 13.5px; text-align: right; }
  .rdca-eur-box:focus-within { border-color: rgba(34,211,238,0.5); }

  .rdca-pct-box {
    display: flex; align-items: center; gap: 4px; background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 10px 10px; flex: 1;
  }
  .rdca-pct-box input { width: 100%; background: transparent; border: none; outline: none; color: #fff; font-size: 13.5px; text-align: right; }
  .rdca-pct-box span { font-size: 12.5px; color: rgba(255,255,255,0.3); }
  .rdca-pct-box:focus-within { border-color: rgba(34,211,238,0.5); }

  .rdca-del {
    flex-shrink: 0; color: rgba(255,255,255,0.3); background: none; border: none; cursor: pointer; padding: 6px;
    transition: transform 120ms cubic-bezier(.34,1.56,.64,1), color 150ms ease;
  }
  .rdca-del:hover { color: #ff5c5c; }
  .rdca-del:active { transform: scale(0.9); }

  .rdca-col-labels { display: flex; gap: 8px; margin-bottom: 8px; padding: 0 2px; }
  .rdca-col-labels span { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255,255,255,0.3); }

  .rdca-add { margin-top: 14px; display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500; color: #67e8f9; background: none; border: none; cursor: pointer; }
  .rdca-add:hover { color: #a5f3fc; }

  .rdca-note { display: flex; align-items: flex-start; gap: 6px; font-size: 12.5px; margin-top: 14px; }

  .rdca-dca-card {
    border-radius: 24px; padding: 20px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(20px) saturate(160%);
    margin-bottom: 18px;
    transition: box-shadow 150ms ease;
  }
  .rdca-dca-card:focus-within { box-shadow: 0 0 0 1px rgba(0,240,255,0.18), 0 0 24px -4px rgba(123,47,255,0.45); }
  .rdca-card-label { display: flex; align-items: center; gap: 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: rgba(255,255,255,0.4); font-weight: 500; margin-bottom: 10px; }
  .rdca-card-value { display: flex; align-items: baseline; gap: 4px; }
  .rdca-card-currency { font-family: 'Space Grotesk', sans-serif; font-size: 22px; color: rgba(255,255,255,0.3); }
  .rdca-card-input {
    width: 100%; background: transparent; border: none; outline: none;
    font-family: 'Space Grotesk', sans-serif; font-size: 32px; font-weight: 700; color: #ffffff;
  }
  .rdca-card-input::placeholder { color: rgba(255,255,255,0.15); }

  .rdca-generate-btn {
    width: 100%;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    padding: 18px 24px;
    border-radius: 20px;
    border: none;
    cursor: pointer;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #05050f;
    background: linear-gradient(90deg, #00f0ff 0%, #7b2fff 50%, #ff2e9a 100%);
    box-shadow: 0 0 24px 0 rgba(0,240,255,0.45), 0 0 50px 4px rgba(123,47,255,0.30);
    animation: pulseGlow 2.4s ease-in-out infinite;
    transition: transform 120ms cubic-bezier(.34,1.56,.64,1), filter 150ms ease;
  }
  .rdca-generate-btn:hover { filter: brightness(1.08); }
  .rdca-generate-btn:active { transform: scale(0.96); filter: brightness(1.2); }
  .rdca-generate-btn:disabled { opacity: 0.35; cursor: not-allowed; animation: none; box-shadow: none; }

  .rdca-secondary-btn {
    width: 100%;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 14px 22px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.14);
    cursor: pointer;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13.5px;
    font-weight: 600;
    letter-spacing: 0.03em;
    color: #ffffff;
    background: rgba(255,255,255,0.04);
    backdrop-filter: blur(20px) saturate(160%);
    transition: transform 120ms cubic-bezier(.34,1.56,.64,1), background 150ms ease;
  }
  .rdca-secondary-btn:hover { background: rgba(255,255,255,0.08); }
  .rdca-secondary-btn:active { transform: scale(0.96); }
  .rdca-secondary-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  .rdca-empty { border-radius: 24px; border: 1px dashed rgba(255,255,255,0.12); padding: 48px 20px; text-align: center; margin-top: 8px; }
  .rdca-empty p { font-size: 14px; color: rgba(255,255,255,0.3); margin: 0; }

  .rdca-result { display: grid; gap: 20px; align-items: center; margin-top: 24px; }
  @media (min-width: 640px) { .rdca-result { grid-template-columns: 210px 1fr; } }

  .rdca-donut-wrap { position: relative; width: 210px; height: 210px; margin: 0 auto; filter: drop-shadow(0 0 14px rgba(0,240,255,0.35)) drop-shadow(0 0 24px rgba(123,47,255,0.25)); }
  @media (min-width: 640px) { .rdca-donut-wrap { margin: 0; } }
  .rdca-donut-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; text-align: center; }
  .rdca-donut-total { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; line-height: 1; color: #ffffff; }
  .rdca-donut-sub { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(255,255,255,0.4); margin-top: 6px; }

  .rdca-table { border-radius: 24px; overflow: hidden; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(20px) saturate(160%); }
  .rdca-table-head { padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.1); }
  .rdca-table-head h2 { margin: 0; font-size: 12.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: rgba(255,255,255,0.45); }
  .rdca-table-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); transition: background 150ms ease; }
  .rdca-table-row:last-child { border-bottom: none; }
  .rdca-table-row:hover { background: rgba(255,255,255,0.03); }
  .rdca-table-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .rdca-asset-name { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .rdca-asset-pct { font-size: 11px; color: rgba(255,255,255,0.35); flex-shrink: 0; }
  .rdca-asset-reason { display: block; font-size: 10.5px; margin-top: 2px; }
  .rdca-asset-amount { font-family: 'Space Grotesk', sans-serif; font-size: 17px; font-weight: 700; flex-shrink: 0; margin-left: 10px; color: #ffffff; }
  .rdca-table-foot { padding: 12px 20px; background: rgba(255,255,255,0.02); display: flex; align-items: center; justify-content: space-between; }
  .rdca-table-foot span:first-child { font-size: 12.5px; color: rgba(255,255,255,0.4); }
  .rdca-table-foot span:last-child { font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.7); }

  .rdca-footer { margin-top: 36px; display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: rgba(255,255,255,0.25); gap: 12px; }
  .rdca-footer span:last-child { display: flex; align-items: center; gap: 4px; white-space: nowrap; }
`;

export default function App() {
  const [assets, setAssets] = useState(DEFAULT_ASSETS);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [dca, setDca] = useState("");
  const [saveState, setSaveState] = useState("idle");
  const [showChart, setShowChart] = useState(false);
  const [chartMode, setChartMode] = useState("forecast"); // "forecast" | "current"
  const saveTimeout = useRef(null);

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

  useEffect(() => {
    if (!loaded) return;
    setSaveState("saving");
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
        setSaveState("saved");
      } catch (e) {
        setSaveState("idle");
      }
    }, 400);
    return () => clearTimeout(saveTimeout.current);
  }, [assets, loaded]);

  // Si se edita la configuración o el importe, el gráfico se oculta hasta volver a generarlo
  useEffect(() => {
    setShowChart(false);
  }, [assets, dca]);

  const targetSum = useMemo(
    () => assets.reduce((s, a) => s + (Number(a.target) || 0), 0),
    [assets]
  );

  const totalInvested = useMemo(
    () => assets.reduce((s, a) => s + (Number(a.invested) || 0), 0),
    [assets]
  );

  const dcaNum = Number(String(dca).replace(",", ".")) || 0;
  const canCalculate = dcaNum > 0 && targetSum > 0;

  const rows = useMemo(() => {
    if (!canCalculate) return [];
    const newTotal = totalInvested + dcaNum;

    // 1) Calculamos el ideal y el déficit de cada activo respecto a su % objetivo
    const items = assets.map((a, i) => {
      const pct = (Number(a.target) || 0) / targetSum;
      const current = Number(a.invested) || 0;
      const ideal = newTotal * pct;
      const deficit = ideal - current; // positivo = infraponderado, negativo/0 = sobreponderado
      return { ...a, color: PALETTE[i % PALETTE.length], pct, current, ideal, deficit };
    });

    const underweight = items.filter((it) => it.deficit > 0);
    const sumDeficit = underweight.reduce((s, it) => s + it.deficit, 0);

    let invest = {};
    let status = {};
    items.forEach((it) => {
      invest[it.id] = 0;
      status[it.id] = "over"; // por defecto: sobreponderado, recibe 0€
    });

    if (underweight.length === 0) {
      // Nadie está infraponderado: repartimos la aportación según el % objetivo de todos
      items.forEach((it) => {
        invest[it.id] = dcaNum * it.pct;
        status[it.id] = "proportional";
      });
    } else if (sumDeficit <= dcaNum) {
      // Hay para igualar a todos los infraponderados a su objetivo, y sobra dinero.
      // Lo que sobra se reparte proporcionalmente entre esos mismos activos infraponderados
      // (nunca se mete en los que ya están por encima, para no desequilibrarlos más).
      const leftover = dcaNum - sumDeficit;
      const sumPctUnderweight = underweight.reduce((s, it) => s + it.pct, 0);
      underweight.forEach((it) => {
        invest[it.id] = it.deficit + leftover * (it.pct / sumPctUnderweight);
        status[it.id] = "filled";
      });
    } else {
      // No llega para igualar a todos este mes: se reparte proporcionalmente
      // al déficit de cada uno, priorizando a quien más lejos está de su objetivo.
      underweight.forEach((it) => {
        invest[it.id] = dcaNum * (it.deficit / sumDeficit);
        status[it.id] = "partial";
      });
    }

    return items.map((it) => ({ ...it, invest: invest[it.id], status: status[it.id] }));
  }, [assets, dcaNum, totalInvested, targetSum, canCalculate]);

  // Distribución actual real de la cartera, sin aplicar el DCA de este mes
  const currentRows = useMemo(() => {
    if (totalInvested <= 0) return [];
    return assets.map((a, i) => {
      const current = Number(a.invested) || 0;
      const pctTarget = (Number(a.target) || 0) / (targetSum || 1);
      const pctCurrent = current / totalInvested;
      return { ...a, color: PALETTE[i % PALETTE.length], current, pctTarget, pctCurrent };
    });
  }, [assets, totalInvested, targetSum]);

  function updateAsset(id, field, value) {
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  }
  function addAsset() {
    setAssets((prev) => [...prev, { id: uid(), name: "", target: 0, invested: 0 }]);
  }
  function removeAsset(id) {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="rdca-root">
      <style>{CSS}</style>

      <div className="rdca-bg">
        <div className="rdca-blob blob-1" />
        <div className="rdca-blob blob-2" />
        <div className="rdca-blob blob-3" />
        <div className="rdca-vignette" />
      </div>

      <div className="rdca-wrap">
        <header className="rdca-header">
          <div>
            <div className="rdca-eyebrow">
              <Sparkles size={14} />
              <span>Rebalanceo · DCA Engine</span>
            </div>
            <h1 className="rdca-title">
              Tu aportación
              <br />
              de este mes
            </h1>
          </div>
          <button className="rdca-btn-ghost" onClick={() => setEditing((v) => !v)}>
            <Settings2 size={14} />
            {editing ? "Listo" : "Configurar"}
          </button>
        </header>

        {editing && (
          <section className="rdca-panel">
            <div className="rdca-panel-head">
              <h2 className="rdca-panel-label">Activos, invertido y % objetivo</h2>
              <span className={`rdca-pill ${targetSum === 100 ? "pill-ok" : "pill-warn"}`}>
                Suma: {targetSum}%
              </span>
            </div>

            <div>
              {assets.map((a, i) => (
                <div key={a.id} className="rdca-row">
                  <div className="rdca-row-top">
                    <span
                      className="rdca-dot"
                      style={{ background: PALETTE[i % PALETTE.length], boxShadow: `0 0 10px ${PALETTE[i % PALETTE.length]}` }}
                    />
                    <input
                      className="rdca-input-name"
                      value={a.name}
                      onChange={(e) => updateAsset(a.id, "name", e.target.value)}
                      placeholder="Nombre del activo"
                    />
                    <button className="rdca-del" onClick={() => removeAsset(a.id)} aria-label="Eliminar activo">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="rdca-row-bottom">
                    <div className="rdca-field-group">
                      <label>Invertido</label>
                      <div className="rdca-eur-box">
                        <span>€</span>
                        <input
                          type="number"
                          value={a.invested}
                          onChange={(e) => updateAsset(a.id, "invested", e.target.value === "" ? "" : Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="rdca-field-group">
                      <label>Objetivo</label>
                      <div className="rdca-pct-box">
                        <input
                          type="number"
                          value={a.target}
                          onChange={(e) => updateAsset(a.id, "target", e.target.value === "" ? "" : Number(e.target.value))}
                        />
                        <span>%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="rdca-add" onClick={addAsset}>
              <Plus size={15} /> Añadir activo
            </button>

            <p className="rdca-note" style={{ color: "rgba(255,255,255,0.45)" }}>
              Cartera total actual:&nbsp;<strong style={{ color: "#fff" }}>{formatEUR(totalInvested)}</strong>&nbsp;(se calcula sola, sumando lo invertido en cada activo)
            </p>

            {targetSum !== 100 && (
              <p className="rdca-note" style={{ color: "#ffb800" }}>
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                Los porcentajes suman {targetSum}%, no 100%. Se normalizarán automáticamente al calcular.
              </p>
            )}

            <p className="rdca-note" style={{ color: "#00ffa3" }}>
              <Check size={13} /> Se guarda solo — no hace falta repetirlo cada mes.
            </p>
          </section>
        )}

        <div className="rdca-dca-card">
          <label className="rdca-card-label">
            <Wallet size={12} /> Aportación DCA de este mes
          </label>
          <div className="rdca-card-value">
            <span className="rdca-card-currency">€</span>
            <input
              type="number"
              inputMode="decimal"
              value={dca}
              onChange={(e) => setDca(e.target.value)}
              placeholder="1000"
              className="rdca-card-input"
            />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            className="rdca-generate-btn"
            onClick={() => { setChartMode("forecast"); setShowChart(true); }}
            disabled={!canCalculate}
          >
            <Zap size={18} />
            GENERAR GRÁFICO
          </button>
          <button
            className="rdca-secondary-btn"
            onClick={() => { setChartMode("current"); setShowChart(true); }}
            disabled={totalInvested <= 0}
          >
            <PieChartIcon size={16} />
            MOSTRAR GRÁFICO ACTUAL
          </button>
        </div>

        {!showChart ? (
          <div className="rdca-empty">
            <p>
              {canCalculate
                ? "Pulsa uno de los botones para ver el gráfico circular."
                : "Introduce la aportación de este mes, o usa MOSTRAR GRÁFICO ACTUAL para ver tu reparto sin aportar nada."}
            </p>
          </div>
        ) : chartMode === "current" ? (
          <section className="rdca-result">
            <div className="rdca-donut-wrap">
              <PieChart width={210} height={210}>
                <Pie
                  data={currentRows}
                  dataKey="current"
                  nameKey="name"
                  innerRadius={68}
                  outerRadius={96}
                  paddingAngle={4}
                  stroke="none"
                  isAnimationActive
                  animationDuration={600}
                >
                  {currentRows.map((r) => (
                    <Cell key={r.id} fill={r.color} />
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
              <div className="rdca-donut-center">
                <span className="rdca-donut-total">{formatEUR(totalInvested)}</span>
                <span className="rdca-donut-sub">cartera actual</span>
              </div>
            </div>

            <div className="rdca-table">
              <div className="rdca-table-head">
                <h2>Distribución actual real</h2>
              </div>
              <div>
                {currentRows.map((r) => {
                  const diff = r.pctCurrent - r.pctTarget;
                  return (
                    <div key={r.id} className="rdca-table-row">
                      <div className="rdca-table-left">
                        <span className="rdca-dot" style={{ background: r.color, boxShadow: `0 0 8px ${r.color}` }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span className="rdca-asset-name">{r.name || "Sin nombre"}</span>
                          </div>
                          <span className="rdca-asset-reason" style={{ color: diff > 0.003 ? "#ffb800" : diff < -0.003 ? "#7B2FFF" : "#00ffa3" }}>
                            Objetivo {Math.round(r.pctTarget * 100)}%
                            {diff > 0.003 ? " · por encima" : diff < -0.003 ? " · por debajo" : " · ajustado"}
                          </span>
                        </div>
                      </div>
                      <span className="rdca-asset-amount" style={{ color: "#fff" }}>
                        {Math.round(r.pctCurrent * 100)}%
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="rdca-table-foot">
                <span>Cartera total</span>
                <span>{formatEUR(totalInvested)}</span>
              </div>
            </div>
          </section>
        ) : (
          <section className="rdca-result">
            <div className="rdca-donut-wrap">
              <PieChart width={210} height={210}>
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
                    <Cell key={r.id} fill={r.color} />
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
              <div className="rdca-donut-center">
                <span className="rdca-donut-total">{formatEUR(dcaNum)}</span>
                <span className="rdca-donut-sub">este mes</span>
              </div>
            </div>

            <div className="rdca-table">
              <div className="rdca-table-head">
                <h2>Invierte así este mes</h2>
              </div>
              <div>
                {rows.map((r) => (
                  <div key={r.id} className="rdca-table-row">
                    <div className="rdca-table-left">
                      <span className="rdca-dot" style={{ background: r.color, boxShadow: `0 0 8px ${r.color}` }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span className="rdca-asset-name">{r.name || "Sin nombre"}</span>
                          <span className="rdca-asset-pct">{Math.round(r.pct * 100)}%</span>
                        </div>
                        {r.status === "over" && (
                          <span className="rdca-asset-reason" style={{ color: "#ffb800" }}>
                            Por encima de su % objetivo · 0€ este mes
                          </span>
                        )}
                        {r.status === "partial" && (
                          <span className="rdca-asset-reason" style={{ color: "#7B2FFF" }}>
                            Reparto parcial · no llega a igualar el objetivo este mes
                          </span>
                        )}
                        {r.status === "filled" && (
                          <span className="rdca-asset-reason" style={{ color: "#00ffa3" }}>
                            Objetivo igualado + sobrante repartido
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="rdca-asset-amount" style={{ color: "#fff" }}>
                      {formatEUR(r.invest)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="rdca-table-foot">
                <span>Nueva cartera total</span>
                <span>{formatEUR(totalInvested + dcaNum)}</span>
              </div>
            </div>
          </section>
        )}

        {showChart && chartMode === "forecast" && rows.some((r) => r.status === "partial") && (
          <p className="rdca-note" style={{ color: "#B967FF" }}>
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            La aportación de este mes no llega para igualar todos los activos infraponderados a su % objetivo.
            Se ha repartido proporcionalmente al déficit de cada uno — el resto se irá ajustando en los próximos meses.
          </p>
        )}

        <footer className="rdca-footer">
          <span>Cálculo: % objetivo aplicado sobre (invertido + aportación).</span>
          <span>
            {saveState === "saving" ? "Guardando…" : saveState === "saved" ? (<><Check size={12} /> Guardado</>) : ""}
          </span>
        </footer>
      </div>
    </div>
  );
}
