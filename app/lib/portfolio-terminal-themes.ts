import type { CSSProperties } from "react";

export type PortfolioTerminalThemeId =
  | "green"
  | "multicolor"
  | "purple"
  | "ice"
  | "rose";

type TerminalThemeVars = CSSProperties & Record<`--${string}`, string>;

export type PortfolioTerminalTheme = {
  id: PortfolioTerminalThemeId;
  label: string;
  summary: string;
  accent: string;
  accentSoft: string;
  pixelBlastColor: string;
  sceneBase: string;
  sceneGradient: string;
  sceneGlow: string;
  terminalVars: TerminalThemeVars;
};

function terminalVars(vars: Record<`--${string}`, string>): TerminalThemeVars {
  return vars as TerminalThemeVars;
}

export const defaultPortfolioTerminalThemeId: PortfolioTerminalThemeId = "green";

export const portfolioTerminalThemes: PortfolioTerminalTheme[] = [
  {
    id: "green",
    label: "Green",
    summary: "Classic phosphor green.",
    accent: "#5efc8d",
    accentSoft: "#bef264",
    pixelBlastColor: "#5efc8d",
    sceneBase: "#020503",
    sceneGradient:
      "radial-gradient(circle at 16% 18%, rgba(94,252,141,0.19), transparent 28%), radial-gradient(circle at 84% 12%, rgba(190,242,100,0.12), transparent 30%), linear-gradient(145deg, #020503 0%, #07110a 42%, #010201 100%)",
    sceneGlow:
      "radial-gradient(circle at 50% 20%, rgba(94,252,141,0.08), transparent 42%), radial-gradient(circle at 50% 100%, rgba(190,242,100,0.05), transparent 35%)",
    terminalVars: terminalVars({
      "--terminal-shell-bg": "rgba(4, 10, 7, 0.9)",
      "--terminal-chrome-bg": "rgba(10, 18, 13, 0.95)",
      "--terminal-border": "rgba(110, 231, 183, 0.18)",
      "--terminal-border-strong": "rgba(190, 242, 100, 0.4)",
      "--terminal-shadow": "rgba(0, 0, 0, 0.55)",
      "--terminal-image-bg": "rgba(0, 0, 0, 0.42)",
      "--terminal-image-border": "rgba(110, 231, 183, 0.16)",
      "--terminal-text-default": "rgba(236, 253, 245, 0.78)",
      "--terminal-text-strong": "#ecfdf5",
      "--terminal-text-muted": "rgba(110, 231, 183, 0.5)",
      "--terminal-text-accent": "#bef264",
      "--terminal-text-success": "#6ee7b7",
      "--terminal-text-warning": "#d9f99d",
      "--terminal-link-hover": "#f0fdf4",
      "--terminal-token-command": "#6ee7b7",
      "--terminal-token-flag": "#bef264",
      "--terminal-token-string": "#dcfce7",
      "--terminal-token-number": "#a7f3d0",
      "--terminal-token-operator": "#34d399",
      "--terminal-token-path": "#86efac",
      "--terminal-token-variable": "#d9f99d",
      "--terminal-token-comment": "rgba(22, 101, 52, 0.72)",
      "--terminal-token-default": "rgba(236, 253, 245, 0.82)",
      "--terminal-prompt-dim": "rgba(110, 231, 183, 0.55)",
      "--terminal-prompt-user": "#6ee7b7",
      "--terminal-prompt-divider": "#10b981",
      "--terminal-prompt-path": "#bef264",
      "--terminal-prompt-symbol": "rgba(167, 243, 208, 0.72)",
      "--terminal-cursor": "#bbf7d0",
      "--terminal-cursor-disabled": "rgba(74, 222, 128, 0.38)",
      "--terminal-input-text": "rgba(236, 253, 245, 0.82)",
      "--terminal-quick-label": "rgba(110, 231, 183, 0.45)",
      "--terminal-quick-button-text": "rgba(209, 250, 229, 0.72)",
      "--terminal-quick-button-border": "rgba(110, 231, 183, 0.2)",
      "--terminal-quick-button-bg": "rgba(0, 0, 0, 0.12)",
      "--terminal-scrollbar-track": "rgba(4, 10, 7, 0.88)",
      "--terminal-scrollbar-thumb": "rgba(110, 231, 183, 0.62)",
      "--terminal-scrollbar-thumb-hover": "#bef264",
    }),
  },
  {
    id: "purple",
    label: "Purple",
    summary: "Electric violet glow.",
    accent: "#a855f7",
    accentSoft: "#e879f9",
    pixelBlastColor: "#a855f7",
    sceneBase: "#07020f",
    sceneGradient:
      "radial-gradient(circle at 18% 16%, rgba(168,85,247,0.26), transparent 29%), radial-gradient(circle at 82% 10%, rgba(232,121,249,0.16), transparent 32%), linear-gradient(145deg, #07020f 0%, #140623 48%, #040108 100%)",
    sceneGlow:
      "radial-gradient(circle at 50% 10%, rgba(168,85,247,0.12), transparent 38%), radial-gradient(circle at 50% 100%, rgba(232,121,249,0.08), transparent 32%)",
    terminalVars: terminalVars({
      "--terminal-shell-bg": "rgba(12, 5, 21, 0.92)",
      "--terminal-chrome-bg": "rgba(21, 9, 35, 0.96)",
      "--terminal-border": "rgba(168, 85, 247, 0.2)",
      "--terminal-border-strong": "rgba(232, 121, 249, 0.44)",
      "--terminal-shadow": "rgba(0, 0, 0, 0.58)",
      "--terminal-image-bg": "rgba(9, 2, 16, 0.42)",
      "--terminal-image-border": "rgba(168, 85, 247, 0.2)",
      "--terminal-text-default": "rgba(249, 245, 255, 0.8)",
      "--terminal-text-strong": "#faf5ff",
      "--terminal-text-muted": "rgba(192, 132, 252, 0.58)",
      "--terminal-text-accent": "#e879f9",
      "--terminal-text-success": "#c084fc",
      "--terminal-text-warning": "#f5d0fe",
      "--terminal-link-hover": "#f5f3ff",
      "--terminal-token-command": "#c084fc",
      "--terminal-token-flag": "#e879f9",
      "--terminal-token-string": "#f3e8ff",
      "--terminal-token-number": "#ddd6fe",
      "--terminal-token-operator": "#9333ea",
      "--terminal-token-path": "#d946ef",
      "--terminal-token-variable": "#f5d0fe",
      "--terminal-token-comment": "rgba(107, 33, 168, 0.72)",
      "--terminal-token-default": "rgba(249, 245, 255, 0.84)",
      "--terminal-prompt-dim": "rgba(192, 132, 252, 0.58)",
      "--terminal-prompt-user": "#c084fc",
      "--terminal-prompt-divider": "#9333ea",
      "--terminal-prompt-path": "#e879f9",
      "--terminal-prompt-symbol": "rgba(221, 214, 254, 0.76)",
      "--terminal-cursor": "#f5d0fe",
      "--terminal-cursor-disabled": "rgba(147, 51, 234, 0.38)",
      "--terminal-input-text": "rgba(249, 245, 255, 0.82)",
      "--terminal-quick-label": "rgba(192, 132, 252, 0.48)",
      "--terminal-quick-button-text": "rgba(243, 232, 255, 0.74)",
      "--terminal-quick-button-border": "rgba(168, 85, 247, 0.24)",
      "--terminal-quick-button-bg": "rgba(0, 0, 0, 0.14)",
      "--terminal-scrollbar-track": "rgba(12, 5, 21, 0.9)",
      "--terminal-scrollbar-thumb": "rgba(168, 85, 247, 0.66)",
      "--terminal-scrollbar-thumb-hover": "#e879f9",
    }),
  },
  {
    id: "ice",
    label: "Ice",
    summary: "Cold cyan midnight.",
    accent: "#7dd3fc",
    accentSoft: "#67e8f9",
    pixelBlastColor: "#7dd3fc",
    sceneBase: "#02070c",
    sceneGradient:
      "radial-gradient(circle at 15% 16%, rgba(125,211,252,0.22), transparent 28%), radial-gradient(circle at 86% 14%, rgba(103,232,249,0.13), transparent 31%), linear-gradient(145deg, #02070c 0%, #091722 45%, #010305 100%)",
    sceneGlow:
      "radial-gradient(circle at 50% 16%, rgba(125,211,252,0.1), transparent 40%), radial-gradient(circle at 50% 100%, rgba(34,211,238,0.05), transparent 32%)",
    terminalVars: terminalVars({
      "--terminal-shell-bg": "rgba(3, 10, 17, 0.9)",
      "--terminal-chrome-bg": "rgba(8, 18, 28, 0.95)",
      "--terminal-border": "rgba(125, 211, 252, 0.18)",
      "--terminal-border-strong": "rgba(103, 232, 249, 0.42)",
      "--terminal-shadow": "rgba(0, 0, 0, 0.58)",
      "--terminal-image-bg": "rgba(1, 7, 12, 0.42)",
      "--terminal-image-border": "rgba(125, 211, 252, 0.18)",
      "--terminal-text-default": "rgba(240, 249, 255, 0.8)",
      "--terminal-text-strong": "#f0f9ff",
      "--terminal-text-muted": "rgba(125, 211, 252, 0.5)",
      "--terminal-text-accent": "#67e8f9",
      "--terminal-text-success": "#7dd3fc",
      "--terminal-text-warning": "#bae6fd",
      "--terminal-link-hover": "#e0f2fe",
      "--terminal-token-command": "#7dd3fc",
      "--terminal-token-flag": "#67e8f9",
      "--terminal-token-string": "#e0f2fe",
      "--terminal-token-number": "#bae6fd",
      "--terminal-token-operator": "#38bdf8",
      "--terminal-token-path": "#22d3ee",
      "--terminal-token-variable": "#a5f3fc",
      "--terminal-token-comment": "rgba(12, 74, 110, 0.78)",
      "--terminal-token-default": "rgba(240, 249, 255, 0.84)",
      "--terminal-prompt-dim": "rgba(125, 211, 252, 0.55)",
      "--terminal-prompt-user": "#7dd3fc",
      "--terminal-prompt-divider": "#38bdf8",
      "--terminal-prompt-path": "#67e8f9",
      "--terminal-prompt-symbol": "rgba(186, 230, 253, 0.78)",
      "--terminal-cursor": "#bae6fd",
      "--terminal-cursor-disabled": "rgba(56, 189, 248, 0.38)",
      "--terminal-input-text": "rgba(240, 249, 255, 0.82)",
      "--terminal-quick-label": "rgba(125, 211, 252, 0.46)",
      "--terminal-quick-button-text": "rgba(224, 242, 254, 0.74)",
      "--terminal-quick-button-border": "rgba(125, 211, 252, 0.22)",
      "--terminal-quick-button-bg": "rgba(0, 0, 0, 0.14)",
      "--terminal-scrollbar-track": "rgba(3, 10, 17, 0.9)",
      "--terminal-scrollbar-thumb": "rgba(125, 211, 252, 0.64)",
      "--terminal-scrollbar-thumb-hover": "#67e8f9",
    }),
  },
  {
    id: "rose",
    label: "Rose",
    summary: "Hot rose signal.",
    accent: "#fb7185",
    accentSoft: "#fda4af",
    pixelBlastColor: "#fb7185",
    sceneBase: "#090204",
    sceneGradient:
      "radial-gradient(circle at 18% 15%, rgba(251,113,133,0.2), transparent 27%), radial-gradient(circle at 84% 12%, rgba(253,164,175,0.12), transparent 31%), linear-gradient(145deg, #090204 0%, #1a0810 45%, #040102 100%)",
    sceneGlow:
      "radial-gradient(circle at 50% 16%, rgba(251,113,133,0.08), transparent 40%), radial-gradient(circle at 50% 100%, rgba(253,164,175,0.05), transparent 30%)",
    terminalVars: terminalVars({
      "--terminal-shell-bg": "rgba(15, 4, 7, 0.9)",
      "--terminal-chrome-bg": "rgba(25, 9, 13, 0.95)",
      "--terminal-border": "rgba(251, 113, 133, 0.18)",
      "--terminal-border-strong": "rgba(253, 164, 175, 0.44)",
      "--terminal-shadow": "rgba(0, 0, 0, 0.58)",
      "--terminal-image-bg": "rgba(11, 1, 4, 0.42)",
      "--terminal-image-border": "rgba(251, 113, 133, 0.18)",
      "--terminal-text-default": "rgba(255, 241, 242, 0.8)",
      "--terminal-text-strong": "#fff1f2",
      "--terminal-text-muted": "rgba(251, 113, 133, 0.5)",
      "--terminal-text-accent": "#fda4af",
      "--terminal-text-success": "#fb7185",
      "--terminal-text-warning": "#fecdd3",
      "--terminal-link-hover": "#ffe4e6",
      "--terminal-token-command": "#fb7185",
      "--terminal-token-flag": "#fda4af",
      "--terminal-token-string": "#ffe4e6",
      "--terminal-token-number": "#fecdd3",
      "--terminal-token-operator": "#f43f5e",
      "--terminal-token-path": "#fb7185",
      "--terminal-token-variable": "#fbcfe8",
      "--terminal-token-comment": "rgba(136, 19, 55, 0.76)",
      "--terminal-token-default": "rgba(255, 241, 242, 0.84)",
      "--terminal-prompt-dim": "rgba(251, 113, 133, 0.54)",
      "--terminal-prompt-user": "#fb7185",
      "--terminal-prompt-divider": "#f43f5e",
      "--terminal-prompt-path": "#fda4af",
      "--terminal-prompt-symbol": "rgba(254, 205, 211, 0.78)",
      "--terminal-cursor": "#fecdd3",
      "--terminal-cursor-disabled": "rgba(244, 63, 94, 0.38)",
      "--terminal-input-text": "rgba(255, 241, 242, 0.82)",
      "--terminal-quick-label": "rgba(251, 113, 133, 0.46)",
      "--terminal-quick-button-text": "rgba(255, 228, 230, 0.74)",
      "--terminal-quick-button-border": "rgba(251, 113, 133, 0.22)",
      "--terminal-quick-button-bg": "rgba(0, 0, 0, 0.14)",
      "--terminal-scrollbar-track": "rgba(15, 4, 7, 0.9)",
      "--terminal-scrollbar-thumb": "rgba(251, 113, 133, 0.64)",
      "--terminal-scrollbar-thumb-hover": "#fda4af",
    }),
  },
  {
    id: "multicolor",
    label: "Multicolour",
    summary: "Mixed neon highlights.",
    accent: "#66d9ef",
    accentSoft: "#ff79c6",
    pixelBlastColor: "#ffffff",
    sceneBase: "#030303",
    sceneGradient:
      "radial-gradient(circle at 16% 18%, rgba(255,255,255,0.08), transparent 28%), radial-gradient(circle at 84% 12%, rgba(255,255,255,0.05), transparent 30%), linear-gradient(145deg, #030303 0%, #080808 42%, #010101 100%)",
    sceneGlow:
      "radial-gradient(circle at 50% 20%, rgba(255,255,255,0.05), transparent 42%), radial-gradient(circle at 50% 100%, rgba(255,255,255,0.03), transparent 35%)",
    terminalVars: terminalVars({
      "--terminal-shell-bg": "rgba(5, 5, 5, 0.92)",
      "--terminal-chrome-bg": "rgba(14, 14, 14, 0.96)",
      "--terminal-border": "rgba(255, 255, 255, 0.14)",
      "--terminal-border-strong": "rgba(255, 255, 255, 0.3)",
      "--terminal-shadow": "rgba(0, 0, 0, 0.58)",
      "--terminal-image-bg": "rgba(0, 0, 0, 0.42)",
      "--terminal-image-border": "rgba(255, 255, 255, 0.14)",
      "--terminal-text-default": "#d4d4d4",
      "--terminal-text-strong": "#ffffff",
      "--terminal-text-muted": "rgba(176, 190, 197, 0.62)",
      "--terminal-text-accent": "#66d9ef",
      "--terminal-text-success": "#a6e22e",
      "--terminal-text-warning": "#ff79c6",
      "--terminal-link-hover": "#ffffff",
      "--terminal-token-command": "#82aaff",
      "--terminal-token-flag": "#ff79c6",
      "--terminal-token-string": "#ff9e64",
      "--terminal-token-number": "#c3e88d",
      "--terminal-token-operator": "#ff6188",
      "--terminal-token-path": "#a9dc76",
      "--terminal-token-variable": "#78dce8",
      "--terminal-token-comment": "#7f8c72",
      "--terminal-token-default": "#d4d4d4",
      "--terminal-prompt-dim": "rgba(176, 190, 197, 0.66)",
      "--terminal-prompt-user": "#82aaff",
      "--terminal-prompt-divider": "#ff79c6",
      "--terminal-prompt-path": "#a9dc76",
      "--terminal-prompt-symbol": "rgba(212, 212, 212, 0.82)",
      "--terminal-cursor": "#ffffff",
      "--terminal-cursor-disabled": "rgba(255, 255, 255, 0.36)",
      "--terminal-input-text": "#d4d4d4",
      "--terminal-quick-label": "rgba(176, 190, 197, 0.58)",
      "--terminal-quick-button-text": "rgba(212, 212, 212, 0.82)",
      "--terminal-quick-button-border": "rgba(255, 255, 255, 0.18)",
      "--terminal-quick-button-bg": "rgba(0, 0, 0, 0.14)",
      "--terminal-scrollbar-track": "rgba(255, 255, 255, 0.12)",
      "--terminal-scrollbar-thumb": "rgba(255, 255, 255, 0.74)",
      "--terminal-scrollbar-thumb-hover": "#ffffff",
      "--terminal-topbar-text": "rgba(255, 255, 255, 0.92)",
    }),
  },
];

export const portfolioTerminalThemeMap = Object.fromEntries(
  portfolioTerminalThemes.map((theme) => [theme.id, theme]),
) as Record<PortfolioTerminalThemeId, PortfolioTerminalTheme>;

export function getPortfolioTerminalTheme(id: PortfolioTerminalThemeId) {
  return portfolioTerminalThemeMap[id];
}

const themeAliases: Record<string, PortfolioTerminalThemeId> = {
  green: "green",
  emerald: "green",
  matrix: "green",
  default: "green",
  multicolor: "multicolor",
  multicolour: "multicolor",
  multi: "multicolor",
  rainbow: "multicolor",
  prism: "multicolor",
  purple: "purple",
  lavender: "purple",
  violet: "purple",
  plum: "purple",
  amber: "purple",
  gold: "purple",
  copper: "purple",
  warm: "purple",
  ice: "ice",
  glacier: "ice",
  cyan: "ice",
  blue: "ice",
  rose: "rose",
  pink: "rose",
  coral: "rose",
  signal: "rose",
  red: "rose",
};

export function resolvePortfolioTerminalTheme(query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  const themeId = themeAliases[normalized];

  if (!themeId) {
    return null;
  }

  return getPortfolioTerminalTheme(themeId);
}
