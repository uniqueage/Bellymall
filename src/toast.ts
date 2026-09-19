export type ToastItem = {
  id: number;
  message: string;
  icon: string;
  leaving?: boolean;
};

let toasts: ToastItem[] = [];
let seq = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function toast(message: string, icon = "fa-circle-check") {
  const id = ++seq;
  toasts = [...toasts, { id, message, icon }];
  emit();
  window.setTimeout(() => {
    toasts = toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t));
    emit();
    window.setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
      emit();
    }, 320);
  }, 2600);
}

export function subscribeToasts(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getToasts(): ToastItem[] {
  return toasts;
}
