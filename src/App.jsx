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
  TrendingUp,
  TrendingDown,
  Gauge,
  Bitcoin,
  Atom,
  Gem,
  Cpu,
  Pickaxe,
  Globe,
  HeartPulse,
  Layers,
  CircleDollarSign,
  Award,
  ScanLine,
  Fingerprint,
  ShieldCheck,
} from "lucide-react";

function getAssetIcon(name = "") {
  const n = name.toLowerCase();
  if (n.includes("bitcoin") || n.includes("btc")) return Bitcoin;
  if (n.includes("ionq") || n.includes("quantum")) return Atom;
  if (n.includes("gold") || n.includes("oro")) return Gem;
  if (n.includes("asml") || n.includes("semicon")) return Cpu;
  if (n.includes("cameco") || n.includes("copper") || n.includes("miner") || n.includes("mining") || n.includes("uranio") || n.includes("uranium")) return Pickaxe;
  if (n.includes("uhg") || n.includes("health") || n.includes("united")) return HeartPulse;
  if (n.includes("small")) return Layers;
  if (n.includes("world") || n.includes("emerging") || n.includes("global") || n.includes("msci")) return Globe;
  return CircleDollarSign;
}

const STORAGE_KEY = "rebalanceo-dca:config:v3";

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

function useAnimatedNumber(value, duration = 650) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const rafRef = useRef(null);

  useEffect(() => {
    const start = prevRef.current;
    const startTime = performance.now();
    cancelAnimationFrame(rafRef.current);

    function tick(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(start + (value - start) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevRef.current = value;
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return display;
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

  .rdca-health-panel {
    display: flex; align-items: center; gap: 16px;
    border-radius: 22px; padding: 14px 18px; margin-bottom: 22px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(20px) saturate(160%);
  }
  .rdca-health-ring { position: relative; width: 76px; height: 76px; flex-shrink: 0; }
  .rdca-health-ring-center {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 17px; color: #fff;
  }
  .rdca-health-info { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .rdca-health-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255,255,255,0.4); font-weight: 600; }
  .rdca-health-dev { font-size: 13px; font-weight: 500; }
  .rdca-health-empty { font-size: 12.5px; color: rgba(255,255,255,0.3); }

  .rdca-confirm-btn {
    width: 100%; margin-top: 14px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 14px 20px; border-radius: 18px; border: 1px solid rgba(0,255,163,0.35);
    cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-size: 13.5px; font-weight: 700;
    letter-spacing: 0.03em; color: #00ffa3; background: rgba(0,255,163,0.08);
    transition: transform 120ms cubic-bezier(.34,1.56,.64,1), background 150ms ease;
  }
  .rdca-confirm-btn:hover { background: rgba(0,255,163,0.16); }
  .rdca-confirm-btn:active { transform: scale(0.96); }

  .rdca-confetti-layer { position: fixed; inset: 0; pointer-events: none; z-index: 60; overflow: hidden; }
  .rdca-confetti-piece {
    position: absolute; top: 16%; left: 50%; width: 8px; height: 14px; border-radius: 2px;
    animation: confettiFall 1500ms ease-out forwards;
  }
  @keyframes confettiFall {
    0% { transform: translate(-50%, 0) rotate(0deg); opacity: 1; }
    100% { transform: translate(var(--tx), var(--ty)) rotate(var(--rot)); opacity: 0; }
  }

  /* Latido de alerta cuando la salud de la cartera es baja */
  @keyframes ringAlertPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255,92,92,0.55); }
    50% { box-shadow: 0 0 0 10px rgba(255,92,92,0); }
  }
  .rdca-health-ring--alert { border-radius: 50%; animation: ringAlertPulse 1.6s ease-out infinite; }

  /* Fondo reactivo según la salud de la cartera */
  .mood-warn .blob-1, .mood-warn .blob-3 { background: radial-gradient(circle, rgba(255,184,0,0.32) 0%, transparent 70%) !important; }
  .mood-warn .blob-2 { background: radial-gradient(circle, rgba(255,92,92,0.26) 0%, transparent 70%) !important; }
  .mood-alert .blob-1, .mood-alert .blob-3 { background: radial-gradient(circle, rgba(255,92,92,0.36) 0%, transparent 70%) !important; }
  .mood-alert .blob-2 { background: radial-gradient(circle, rgba(255,46,154,0.3) 0%, transparent 70%) !important; }

  /* Icono por tipo de activo */
  .rdca-asset-icon {
    width: 26px; height: 26px; border-radius: 9px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }

  /* Sparkline de tendencia */
  .rdca-sparkline { display: block; margin-top: 3px; }

  /* Insignia holográfica de logro */
  .rdca-badge-layer {
    position: fixed; inset: 0; z-index: 70; display: flex; align-items: center; justify-content: center;
    pointer-events: none; background: rgba(5,5,15,0.35); backdrop-filter: blur(2px);
    animation: badgeFadeInOut 2.2s ease forwards;
  }
  @keyframes badgeFadeInOut { 0% { opacity: 0; } 12% { opacity: 1; } 82% { opacity: 1; } 100% { opacity: 0; } }
  .rdca-badge-card {
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    padding: 28px 36px; border-radius: 28px;
    background: linear-gradient(160deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02));
    border: 1px solid rgba(255,255,255,0.25);
    box-shadow: 0 0 0 1px rgba(0,240,255,0.25), 0 0 60px 10px rgba(123,47,255,0.45), 0 0 100px 20px rgba(255,46,154,0.25);
    animation: badgePop 2.2s cubic-bezier(.2,1.4,.4,1) forwards;
  }
  @keyframes badgePop { 0% { transform: scale(0.7) rotate(-4deg); } 14% { transform: scale(1.06) rotate(2deg); } 22% { transform: scale(1) rotate(0deg); } 85% { transform: scale(1) rotate(0deg); } 100% { transform: scale(0.92) rotate(0deg); } }
  .rdca-badge-icon {
    width: 64px; height: 64px; border-radius: 50%;
    background: linear-gradient(135deg, #00f0ff, #7b2fff 50%, #ff2e9a);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 30px rgba(0,240,255,0.6);
  }
  .rdca-badge-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 17px; color: #fff; }
  .rdca-badge-sub { font-size: 12.5px; color: rgba(255,255,255,0.55); }

  /* Vista de rayos X del donut */
  .rdca-xray-hint { text-align: center; font-size: 10.5px; color: rgba(255,255,255,0.25); margin-top: 8px; }
  .rdca-xray-chip {
    position: absolute; display: flex; align-items: center; gap: 5px;
    background: rgba(5,5,15,0.85); border: 1px solid rgba(255,255,255,0.18);
    border-radius: 999px; padding: 3px 8px; font-size: 10.5px; white-space: nowrap;
    backdrop-filter: blur(6px); animation: xrayIn 220ms ease forwards;
  }
  @keyframes xrayIn { 0% { opacity: 0; transform: scale(0.6); } 100% { opacity: 1; transform: scale(1); } }
`;

function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  const w = 56;
  const h = 16;
  const max = Math.max(...data.map((v) => Math.abs(v)), 1);
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h / 2 - (v / max) * (h / 2 - 1);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg className="rdca-sparkline" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <line x1="0" y1={h / 2} x2={w} y2={h / 2} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Dashboard() {
  const [assets, setAssets] = useState(DEFAULT_ASSETS);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [dca, setDca] = useState("");
  const [saveState, setSaveState] = useState("idle");
  const [showChart, setShowChart] = useState(false);
  const [chartMode, setChartMode] = useState("forecast"); // "forecast" | "current"
  const [configVersion, setConfigVersion] = useState(0);
  const [confettiBurst, setConfettiBurst] = useState(null);
  const [trend, setTrend] = useState({}); // { [assetId]: number[] } últimas desviaciones (pp)
  const [badge, setBadge] = useState(false);
  const [xray, setXray] = useState(false);
  const saveTimeout = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.assets) && parsed.assets.length > 0) {
          setAssets(parsed.assets);
          setTrend(parsed.trend || {});
        } else if (Array.isArray(parsed) && parsed.length > 0) {
          setAssets(parsed);
        }
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ assets, trend }));
        setSaveState("saved");
      } catch (e) {
        setSaveState("idle");
      }
    }, 400);
    return () => clearTimeout(saveTimeout.current);
  }, [assets, trend, loaded]);

  // Si se edita la configuración manualmente o cambia el importe, el gráfico se oculta
  // hasta volver a generarlo. Confirmar una aportación NO pasa por aquí (no usa configVersion).
  useEffect(() => {
    setShowChart(false);
  }, [configVersion, dca]);

  useEffect(() => {
    setXray(false);
  }, [chartMode, showChart]);

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

  // Salud de la cartera: 0-100, basada en cuánto se desvía el % real de cada activo de su objetivo.
  // Siempre montado, así que al confirmar una aportación el anillo anima ("morph") hacia el nuevo valor.
  const health = useMemo(() => {
    if (currentRows.length === 0) return null;
    const totalDeviation = currentRows.reduce((s, r) => s + Math.abs(r.pctCurrent - r.pctTarget), 0);
    const score = Math.max(0, Math.min(100, Math.round(100 - totalDeviation * 150)));
    const maxDev = currentRows.reduce(
      (best, r) => {
        const diff = r.pctCurrent - r.pctTarget;
        return Math.abs(diff) > Math.abs(best.diff) ? { name: r.name, diff } : best;
      },
      { name: "", diff: 0 }
    );
    return { score, maxDev };
  }, [currentRows]);

  function healthColor(score) {
    if (score >= 90) return "#00ffa3";
    if (score >= 70) return "#00f0ff";
    if (score >= 45) return "#ffb800";
    return "#ff5c5c";
  }

  const animatedScore = useAnimatedNumber(health ? health.score : 0);
  const animatedDcaTotal = useAnimatedNumber(totalInvested + dcaNum);
  const animatedPortfolioTotal = useAnimatedNumber(totalInvested);

  function triggerConfetti(biasDeg = null) {
    const colors = PALETTE;
    const particles = Array.from({ length: 32 }).map((_, i) => {
      const angle = biasDeg != null ? biasDeg + (Math.random() - 0.5) * 80 : (Math.random() - 0.5) * 260;
      const dist = 120 + Math.random() * 160;
      const rad = (angle * Math.PI) / 180;
      const tx = Math.sin(rad) * dist;
      const ty = -Math.cos(rad) * dist - 40;
      return {
        id: i,
        color: colors[i % colors.length],
        tx,
        ty,
        rot: Math.round(Math.random() * 540 - 270),
        delay: Math.random() * 120,
        left: 50 + (Math.random() * 30 - 15),
      };
    });
    setConfettiBurst(particles);
    setTimeout(() => setConfettiBurst(null), 1700);
  }

  function confirmContribution() {
    if (!canCalculate || rows.length === 0) return;

    const updatedAssets = assets.map((a) => {
      const r = rows.find((x) => x.id === a.id);
      const added = r ? r.invest : 0;
      return { ...a, invested: Math.round((Number(a.invested) || 0) + added) };
    });

    const newTotal = updatedAssets.reduce((s, a) => s + (Number(a.invested) || 0), 0);
    let newDeviation = 0;
    const newTrend = { ...trend };
    updatedAssets.forEach((a) => {
      const pctT = (Number(a.target) || 0) / (targetSum || 1);
      const pctC = newTotal > 0 ? (Number(a.invested) || 0) / newTotal : 0;
      const diffPP = (pctC - pctT) * 100;
      newDeviation += Math.abs(pctC - pctT);
      const prevArr = newTrend[a.id] || [];
      newTrend[a.id] = [...prevArr, diffPP].slice(-8);
    });
    const newScore = Math.max(0, Math.min(100, Math.round(100 - newDeviation * 150)));

    // Calculamos hacia qué porción del donut dirigir el confeti: la del activo que más recibió
    let cumulative = 0;
    const totalInvestSum = rows.reduce((s, r) => s + Math.max(0, r.invest), 0);
    let biasDeg = null;
    const topRow = rows.reduce((best, r) => (r.invest > (best?.invest || 0) ? r : best), null);
    if (topRow && totalInvestSum > 0) {
      for (const r of rows) {
        if (r.id === topRow.id) break;
        cumulative += Math.max(0, r.invest);
      }
      const fraction = (cumulative + Math.max(0, topRow.invest) / 2) / totalInvestSum;
      biasDeg = fraction * 360;
    }

    setAssets(updatedAssets); // no pasa por updateAsset: no incrementa configVersion
    setTrend(newTrend);
    setDca("");
    setChartMode("current");
    setShowChart(true);

    if (newScore >= 99) {
      setBadge(true);
      setTimeout(() => setBadge(false), 2200);
      triggerConfetti(biasDeg);
    } else if (newScore >= 90) {
      triggerConfetti(biasDeg);
    }
  }

  function computeChipPositions(dataRows, valueKey) {
    const total = dataRows.reduce((s, r) => s + Math.max(0, r[valueKey] || 0), 0);
    if (total <= 0) return [];
    let cum = 0;
    return dataRows
      .filter((r) => (r[valueKey] || 0) > 0.0001)
      .map((r) => {
        const val = Math.max(0, r[valueKey]);
        const startFrac = cum / total;
        cum += val;
        const midFrac = startFrac + val / total / 2;
        const angleDeg = midFrac * 360;
        const rad = (angleDeg * Math.PI) / 180;
        const radius = 122;
        const x = 105 + Math.sin(rad) * radius;
        const y = 105 - Math.cos(rad) * radius;
        return { id: r.id, name: r.name, value: val, x, y, color: r.color };
      });
  }
  function updateAsset(id, field, value) {
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
    setConfigVersion((v) => v + 1);
  }
  function addAsset() {
    setAssets((prev) => [...prev, { id: uid(), name: "", target: 0, invested: 0 }]);
    setConfigVersion((v) => v + 1);
  }
  function removeAsset(id) {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    setConfigVersion((v) => v + 1);
  }

  return (
    <div className="rdca-root">
      <style>{CSS}</style>
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className={`rdca-bg ${health ? (health.score < 45 ? "mood-alert" : health.score < 80 ? "mood-warn" : "") : ""}`}>
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

        {health && (
          <section className="rdca-health-panel">
            <div className={`rdca-health-ring ${health.score < 50 ? "rdca-health-ring--alert" : ""}`}>
              <PieChart width={76} height={76}>
                <Pie
                  data={[
                    { name: "score", value: health.score },
                    { name: "rest", value: 100 - health.score },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={28}
                  outerRadius={37}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                  isAnimationActive
                  animationDuration={800}
                >
                  <Cell fill={healthColor(health.score)} />
                  <Cell fill="rgba(255,255,255,0.08)" />
                </Pie>
              </PieChart>
              <div className="rdca-health-ring-center">{Math.round(animatedScore)}</div>
            </div>
            <div className="rdca-health-info">
              <span className="rdca-health-label">
                <Gauge size={11} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />
                Salud de la cartera
              </span>
              {health.maxDev.name ? (
                <span className="rdca-health-dev" style={{ color: health.maxDev.diff > 0 ? "#ffb800" : "#7B2FFF" }}>
                  {health.maxDev.diff > 0 ? <TrendingUp size={13} style={{ display: "inline", verticalAlign: -2 }} /> : <TrendingDown size={13} style={{ display: "inline", verticalAlign: -2 }} />}
                  {" "}
                  {health.maxDev.name} {health.maxDev.diff > 0 ? "+" : ""}
                  {(health.maxDev.diff * 100).toFixed(1)}pp {health.maxDev.diff > 0 ? "por encima" : "por debajo"}
                </span>
              ) : (
                <span className="rdca-health-empty">Cartera perfectamente calibrada</span>
              )}
            </div>
          </section>
        )}

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
                    {(() => {
                      const Icon = getAssetIcon(a.name);
                      const color = PALETTE[i % PALETTE.length];
                      return (
                        <span className="rdca-asset-icon" style={{ background: `${color}22`, boxShadow: `0 0 10px ${color}55` }}>
                          <Icon size={14} color={color} />
                        </span>
                      );
                    })()}
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
            <div className="rdca-donut-wrap" onClick={() => setXray((v) => !v)} style={{ cursor: "pointer" }}>
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
                <span className="rdca-donut-total">{formatEUR(animatedPortfolioTotal)}</span>
                <span className="rdca-donut-sub">cartera actual</span>
              </div>
              {xray &&
                computeChipPositions(currentRows, "current").map((c) => (
                  <div
                    key={c.id}
                    className="rdca-xray-chip"
                    style={{ left: c.x, top: c.y, transform: "translate(-50%,-50%)", borderColor: `${c.color}55` }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                    {formatEUR(c.value)}
                  </div>
                ))}
            </div>
            <p className="rdca-xray-hint">
              <ScanLine size={11} style={{ display: "inline", verticalAlign: -1, marginRight: 3 }} />
              Toca el gráfico para ver el detalle exacto
            </p>

            <div className="rdca-table">
              <div className="rdca-table-head">
                <h2>Distribución actual real</h2>
              </div>
              <div>
                {currentRows.map((r) => {
                  const diff = r.pctCurrent - r.pctTarget;
                  const Icon = getAssetIcon(r.name);
                  return (
                    <div key={r.id} className="rdca-table-row">
                      <div className="rdca-table-left">
                        <span className="rdca-asset-icon" style={{ background: `${r.color}22` }}>
                          <Icon size={14} color={r.color} />
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span className="rdca-asset-name">{r.name || "Sin nombre"}</span>
                          </div>
                          <span className="rdca-asset-reason" style={{ color: diff > 0.003 ? "#ffb800" : diff < -0.003 ? "#7B2FFF" : "#00ffa3" }}>
                            Objetivo {Math.round(r.pctTarget * 100)}%
                            {diff > 0.003 ? " · por encima" : diff < -0.003 ? " · por debajo" : " · ajustado"}
                          </span>
                          {trend[r.id] && trend[r.id].length >= 2 && (
                            <Sparkline data={trend[r.id]} color={r.color} />
                          )}
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
                <span>{formatEUR(animatedPortfolioTotal)}</span>
              </div>
            </div>
          </section>
        ) : (
          <section className="rdca-result">
            <div className="rdca-donut-wrap" onClick={() => setXray((v) => !v)} style={{ cursor: "pointer" }}>
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
              {xray &&
                computeChipPositions(rows, "invest").map((c) => (
                  <div
                    key={c.id}
                    className="rdca-xray-chip"
                    style={{ left: c.x, top: c.y, transform: "translate(-50%,-50%)", borderColor: `${c.color}55` }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                    {formatEUR(c.value)}
                  </div>
                ))}
            </div>
            <p className="rdca-xray-hint">
              <ScanLine size={11} style={{ display: "inline", verticalAlign: -1, marginRight: 3 }} />
              Toca el gráfico para ver el detalle exacto
            </p>

            <div className="rdca-table">
              <div className="rdca-table-head">
                <h2>Invierte así este mes</h2>
              </div>
              <div>
                {rows.map((r) => {
                  const Icon = getAssetIcon(r.name);
                  return (
                  <div key={r.id} className="rdca-table-row">
                    <div className="rdca-table-left">
                      <span className="rdca-asset-icon" style={{ background: `${r.color}22` }}>
                        <Icon size={14} color={r.color} />
                      </span>
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
                  );
                })}
              </div>
              <div className="rdca-table-foot">
                <span>Nueva cartera total</span>
                <span>{formatEUR(animatedDcaTotal)}</span>
              </div>
            </div>
          </section>
        )}

        {showChart && chartMode === "forecast" && rows.length > 0 && (
          <button className="rdca-confirm-btn" onClick={confirmContribution}>
            <Check size={16} />
            Confirmar aportación de este mes
          </button>
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

      {confettiBurst && (
        <div className="rdca-confetti-layer">
          {confettiBurst.map((p) => (
            <span
              key={p.id}
              className="rdca-confetti-piece"
              style={{
                left: `${p.left}%`,
                background: p.color,
                animationDelay: `${p.delay}ms`,
                "--tx": `${p.tx}px`,
                "--ty": `${p.ty}px`,
                "--rot": `${p.rot}deg`,
              }}
            />
          ))}
        </div>
      )}

      {badge && (
        <div className="rdca-badge-layer">
          <div className="rdca-badge-card">
            <div className="rdca-badge-icon">
              <Award size={30} color="#05050f" />
            </div>
            <span className="rdca-badge-title">Rebalanceo perfecto</span>
            <span className="rdca-badge-sub">Tu cartera está calibrada al 100%</span>
          </div>
        </div>
      )}
    </div>
  );
}

const HOME_CSS = `
  * { box-sizing: border-box; }
  .rdca-home {
    position: fixed; inset: 0; z-index: 100;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    background: radial-gradient(circle at 50% 38%, #0a0f1f 0%, #05050f 55%, #020205 100%);
    overflow: hidden; font-family: 'Inter', sans-serif;
    animation: homeFadeIn 500ms ease;
  }
  .rdca-home.rdca-home--leaving { animation: homeFadeOut 700ms ease forwards; }
  @keyframes homeFadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
  @keyframes homeFadeOut { 0% { opacity: 1; } 100% { opacity: 0; } }

  .rdca-home-scanlines {
    position: absolute; inset: 0; pointer-events: none; opacity: 0.5;
    background: repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 3px);
  }
  .rdca-home-grid {
    position: absolute; inset: -10%; pointer-events: none; opacity: 0.18;
    background-image:
      linear-gradient(rgba(0,240,255,0.5) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,240,255,0.5) 1px, transparent 1px);
    background-size: 42px 42px;
    transform: perspective(560px) rotateX(58deg);
    transform-origin: 50% 100%;
    animation: gridDrift 9s linear infinite;
  }
  @keyframes gridDrift { 0% { background-position: 0 0; } 100% { background-position: 0 84px; } }

  .rdca-home-vignette { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(circle at 50% 45%, transparent 35%, #05050f 88%); }

  .rdca-home-orbit {
    position: absolute; border-radius: 50%; border: 1px solid rgba(0,240,255,0.14);
  }
  .orbit-1 { width: 340px; height: 340px; animation: spinSlow 26s linear infinite; }
  .orbit-2 { width: 440px; height: 440px; border-color: rgba(123,47,255,0.12); animation: spinSlow 38s linear infinite reverse; }
  .orbit-3 { width: 560px; height: 560px; border-color: rgba(255,46,154,0.10); animation: spinSlow 50s linear infinite; }
  .rdca-home-orbit::before {
    content: ''; position: absolute; top: -2px; left: 50%; width: 6px; height: 6px; border-radius: 50%;
    background: #00f0ff; box-shadow: 0 0 10px #00f0ff, 0 0 20px #00f0ff; transform: translateX(-50%);
  }
  @keyframes spinSlow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

  .rdca-home-eyebrow {
    position: relative; z-index: 2; display: flex; align-items: center; gap: 8px; margin-bottom: 46px;
    color: #67e8f9; opacity: 0.85;
  }
  .rdca-home-eyebrow span { font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; font-weight: 600; }

  .rdca-fp-stage { position: relative; z-index: 2; width: 220px; height: 220px; display: flex; align-items: center; justify-content: center; }

  .rdca-fp-ring {
    position: absolute; inset: 0; border-radius: 50%;
    border: 1.5px solid rgba(0,240,255,0.25);
    box-shadow: 0 0 30px rgba(0,240,255,0.15) inset;
  }
  .rdca-fp-ring--scan {
    border: none;
    background: conic-gradient(from 0deg, transparent 0deg, rgba(0,240,255,0.9) 18deg, transparent 50deg);
    animation: fpSweep 1.1s linear infinite;
    mask: radial-gradient(circle, transparent 62%, black 63%, black 100%);
    -webkit-mask: radial-gradient(circle, transparent 62%, black 63%, black 100%);
  }
  @keyframes fpSweep { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

  .rdca-fp-button {
    position: relative; width: 168px; height: 168px; border-radius: 50%;
    background: radial-gradient(circle at 38% 32%, rgba(255,255,255,0.16), rgba(255,255,255,0.02) 45%), linear-gradient(150deg, #0c1426, #05050f);
    border: 1px solid rgba(255,255,255,0.14);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; -webkit-tap-highlight-color: transparent;
    box-shadow: 0 0 0 0 rgba(0,240,255,0.45), 0 20px 60px -10px rgba(0,0,0,0.7);
    transition: transform 160ms cubic-bezier(.34,1.56,.64,1), box-shadow 300ms ease;
    animation: fpIdlePulse 2.6s ease-in-out infinite;
    overflow: hidden;
  }
  .rdca-fp-button:active { transform: scale(0.93); }
  @keyframes fpIdlePulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(0,240,255,0.35), 0 20px 60px -10px rgba(0,0,0,0.7); }
    50% { box-shadow: 0 0 0 14px rgba(0,240,255,0.06), 0 20px 60px -10px rgba(0,0,0,0.7); }
  }
  .rdca-fp-button--scanning { animation: fpScanPulse 0.9s ease-in-out infinite; border-color: rgba(0,240,255,0.5); }
  @keyframes fpScanPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(0,240,255,0.55), 0 20px 60px -10px rgba(0,0,0,0.7); }
    50% { box-shadow: 0 0 0 18px rgba(0,240,255,0.12), 0 20px 60px -10px rgba(0,0,0,0.7); }
  }
  .rdca-fp-button--granted { border-color: rgba(0,255,163,0.6); animation: none; box-shadow: 0 0 0 22px rgba(0,255,163,0.0), 0 0 50px 6px rgba(0,255,163,0.55); }

  .rdca-fp-icon { position: relative; z-index: 2; transition: color 300ms ease, filter 300ms ease; filter: drop-shadow(0 0 10px rgba(0,240,255,0.45)); }
  .rdca-fp-icon--granted { filter: drop-shadow(0 0 14px rgba(0,255,163,0.8)); }

  .rdca-fp-scanbeam {
    position: absolute; left: -10%; width: 120%; height: 26px;
    background: linear-gradient(180deg, transparent, rgba(0,240,255,0.55) 50%, transparent);
    filter: blur(1px);
    animation: fpBeamMove 1.3s ease-in-out infinite;
  }
  @keyframes fpBeamMove { 0% { top: 6%; opacity: 0.9; } 50% { top: 86%; opacity: 0.5; } 100% { top: 6%; opacity: 0.9; } }

  .rdca-fp-label {
    position: relative; z-index: 2; margin-top: 30px;
    font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 700;
    letter-spacing: 0.32em; color: rgba(255,255,255,0.82);
    text-transform: uppercase;
  }
  .rdca-fp-status {
    position: relative; z-index: 2; margin-top: 10px; height: 16px;
    font-size: 11px; letter-spacing: 0.1em; color: rgba(0,240,255,0.75); font-family: 'Space Grotesk', sans-serif;
  }
  .rdca-fp-status--granted { color: #00ffa3; }

  .rdca-home-shockwave {
    position: fixed; left: 50%; top: 50%; width: 40px; height: 40px; margin: -20px 0 0 -20px;
    border-radius: 50%; background: radial-gradient(circle, rgba(0,255,163,0.9), rgba(0,240,255,0.4) 40%, transparent 70%);
    z-index: 5; pointer-events: none;
    animation: shockwaveExpand 900ms cubic-bezier(.2,.8,.2,1) forwards;
  }
  @keyframes shockwaveExpand { 0% { transform: scale(0); opacity: 1; } 100% { transform: scale(55); opacity: 0; } }
`;

function Home({ onUnlock }) {
  const [phase, setPhase] = useState("idle"); // idle | scanning | granted | leaving
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function startScan() {
    if (phase !== "idle") return;
    setPhase("scanning");
    timers.current.push(
      setTimeout(() => setPhase("granted"), 1500),
      setTimeout(() => setPhase("leaving"), 2200),
      setTimeout(() => onUnlock(), 2900)
    );
  }

  const statusText =
    phase === "scanning" ? "ESCANEANDO HUELLA…" : phase === "granted" || phase === "leaving" ? "ACCESO CONCEDIDO" : "";

  return (
    <div className={`rdca-home ${phase === "leaving" ? "rdca-home--leaving" : ""}`}>
      <style>{HOME_CSS}</style>
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="rdca-home-grid" />
      <div className="rdca-home-scanlines" />
      <div className="rdca-home-orbit orbit-3" />
      <div className="rdca-home-orbit orbit-2" />
      <div className="rdca-home-orbit orbit-1" />
      <div className="rdca-home-vignette" />

      <div className="rdca-home-eyebrow">
        <ShieldCheck size={14} />
        <span>Acceso seguro · Rebalanceo DCA</span>
      </div>

      <div className="rdca-fp-stage">
        <div className="rdca-fp-ring" />
        {phase === "scanning" && <div className="rdca-fp-ring rdca-fp-ring--scan" />}
        <button
          className={`rdca-fp-button ${phase === "scanning" ? "rdca-fp-button--scanning" : ""} ${
            phase === "granted" || phase === "leaving" ? "rdca-fp-button--granted" : ""
          }`}
          onClick={startScan}
          aria-label="Identificarse con huella"
        >
          {phase === "scanning" && <div className="rdca-fp-scanbeam" />}
          <Fingerprint
            size={72}
            className={phase === "granted" || phase === "leaving" ? "rdca-fp-icon rdca-fp-icon--granted" : "rdca-fp-icon"}
            color={phase === "granted" || phase === "leaving" ? "#00ffa3" : "#00f0ff"}
            strokeWidth={1.4}
          />
        </button>
      </div>

      <span className="rdca-fp-label">Identificarse</span>
      <span className={`rdca-fp-status ${phase === "granted" || phase === "leaving" ? "rdca-fp-status--granted" : ""}`}>
        {statusText}
      </span>

      {(phase === "granted" || phase === "leaving") && <div className="rdca-home-shockwave" />}
    </div>
  );
}

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  if (!unlocked) return <Home onUnlock={() => setUnlocked(true)} />;
  return <Dashboard />;
}
