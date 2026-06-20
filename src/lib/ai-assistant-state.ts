import { useEffect, useState } from "react";

const EVT = "nexus:ai-assistant-collapsed";
let _collapsed = false;

export function setAiCollapsed(v: boolean) {
  _collapsed = v;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVT, { detail: v }));
  }
}

export function getAiCollapsed() {
  return _collapsed;
}

export function useAiCollapsed() {
  const [v, setV] = useState<boolean>(_collapsed);
  useEffect(() => {
    const h = (e: Event) => setV((e as CustomEvent<boolean>).detail);
    window.addEventListener(EVT, h);
    return () => window.removeEventListener(EVT, h);
  }, []);
  return v;
}
