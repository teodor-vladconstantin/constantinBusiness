"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CommandPalette = dynamic(() => import("./command-palette").then((m) => m.CommandPalette), { ssr: false });

// Mounts the palette after first paint so it stays out of the initial bundle.
export function PaletteLazy() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    idle(() => setReady(true));
  }, []);
  return ready ? <CommandPalette /> : null;
}
