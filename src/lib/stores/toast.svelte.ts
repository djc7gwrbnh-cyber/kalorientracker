export interface ToastAction {
  label: string;
  run: () => void | Promise<void>;
}

export interface ToastState {
  /** Wechselt bei jeder Meldung, damit die Einblendung neu startet. */
  id: number;
  message: string;
  action?: ToastAction;
}

let current = $state.raw<ToastState | null>(null);
let timer: ReturnType<typeof setTimeout> | undefined;
let nextId = 0;

function stopTimer(): void {
  if (timer !== undefined) clearTimeout(timer);
  timer = undefined;
}

export const toastStore = {
  get current(): ToastState | null {
    return current;
  },
  show(message: string, action?: ToastAction, duration = 5000): void {
    stopTimer();
    nextId += 1;
    current = { id: nextId, message, action };
    timer = setTimeout(() => {
      current = null;
      timer = undefined;
    }, duration);
  },
  dismiss(): void {
    stopTimer();
    current = null;
  },
};
