"use client";

import { useEffect, useMemo, useState } from "react";
import PixelBlast from "@/app/components/PixelBlast";
import TerminalPortfolioExperience from "@/app/components/TerminalPortfolioExperience";
import {
  defaultPortfolioTerminalThemeId,
  getPortfolioTerminalTheme,
  portfolioTerminalThemeMap,
  type PortfolioTerminalThemeId,
} from "@/app/lib/portfolio-terminal-themes";

const SESSION_THEME_KEY = "portfolio-terminal-theme";

function readInitialThemeId(): PortfolioTerminalThemeId {
  if (typeof window === "undefined") {
    return defaultPortfolioTerminalThemeId;
  }

  const storedThemeId = window.sessionStorage.getItem(SESSION_THEME_KEY);

  if (
    storedThemeId &&
    storedThemeId in portfolioTerminalThemeMap
  ) {
    return storedThemeId as PortfolioTerminalThemeId;
  }

  return defaultPortfolioTerminalThemeId;
}

type TerminalPortfolioShellProps = {
  showPixelBlast?: boolean;
};

export default function TerminalPortfolioShell({
  showPixelBlast = true,
}: TerminalPortfolioShellProps) {
  const [themeId, setThemeId] = useState<PortfolioTerminalThemeId>(
    defaultPortfolioTerminalThemeId,
  );
  const [themeSessionReady, setThemeSessionReady] = useState(false);

  const activeTheme = useMemo(
    () => getPortfolioTerminalTheme(themeId),
    [themeId],
  );

  useEffect(() => {
    setThemeId(readInitialThemeId());
    setThemeSessionReady(true);
  }, []);

  useEffect(() => {
    if (!themeSessionReady || typeof window === "undefined") {
      return;
    }

    window.sessionStorage.setItem(SESSION_THEME_KEY, themeId);
  }, [themeId, themeSessionReady]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {showPixelBlast ? (
        <div className="fixed inset-0 z-0">
          <PixelBlast
            color={activeTheme.pixelBlastColor}
            transparent
            patternDensity={0.7}
            pixelSize={2.8}
            noiseAmount={0}
          />
        </div>
      ) : null}

      <div className="relative z-10">
        <TerminalPortfolioExperience
          embedded={false}
          solidBackground={false}
          theme={activeTheme}
          onThemeChange={setThemeId}
        />
      </div>
    </div>
  );
}
