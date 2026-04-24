import { useEffect, useRef, useState } from "react";

/**
 * 窄屏或触屏设备：建议不要包 Ant Design Tooltip，
 * 避免触摸后“伪 hover”粘住导致需要点两次。
 */
export function usePreferNoTooltip(): boolean {
  const mq = useRef(
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 991px), (pointer: coarse)")
      : null,
  );
  const [preferNo, setPreferNo] = useState(() => !!mq.current?.matches);

  useEffect(() => {
    const mql = mq.current;
    if (!mql) return;
    const handler = (e: MediaQueryListEvent) => setPreferNo(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return preferNo;
}
