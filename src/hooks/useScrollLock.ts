/* Shared body scroll-lock hook used by mobile nav, cart drawer and modals. */

import { useEffect } from "react";

let locks = 0;

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    locks += 1;
    document.body.classList.add("no-scroll");
    return () => {
      locks -= 1;
      if (locks <= 0) {
        locks = 0;
        document.body.classList.remove("no-scroll");
      }
    };
  }, [active]);
}
