import { useSyncExternalStore } from "react";
import { getToasts, subscribeToasts } from "../toast";

export function Toaster() {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts, getToasts);

  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast${t.leaving ? " is-leaving" : ""}`}>
          <i className={`fa-solid ${t.icon}`}></i>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
