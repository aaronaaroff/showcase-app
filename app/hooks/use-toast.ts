import { useCallback, useEffect, useState } from "react";

type ToastProps = {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  duration?: number;
};

type ToastState = {
  toasts: ToastProps[];
};

const listeners: Array<(state: ToastState) => void> = [];
let memoryState: ToastState = { toasts: [] };

function dispatch(action: { type: "ADD_TOAST" | "UPDATE_TOAST" | "DISMISS_TOAST" | "REMOVE_TOAST"; toast?: ToastProps }) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

function reducer(state: ToastState, action: { type: "ADD_TOAST" | "UPDATE_TOAST" | "DISMISS_TOAST" | "REMOVE_TOAST"; toast?: ToastProps }): ToastState {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast!, ...state.toasts].slice(0, 3),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast!.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toast?.id),
      };

    case "REMOVE_TOAST":
      if (action.toast?.id === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toast?.id),
      };
  }
}

function toast(props: Omit<ToastProps, "id">) {
  const id = Date.now().toString();
  const duration = props.duration ?? 5000;

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      duration,
    },
  });

  if (duration > 0) {
    setTimeout(() => {
      dispatch({
        type: "REMOVE_TOAST",
        toast: { id },
      });
    }, duration);
  }

  return id;
}

export function useToast() {
  const [state, setState] = useState<ToastState>(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (id?: string) => dispatch({ type: "DISMISS_TOAST", toast: { id: id! } }),
  };
}