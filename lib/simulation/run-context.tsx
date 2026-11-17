"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Scenario } from "@/content/types";
import { resetSimulation } from "./state";
import { loadActiveState, persistState } from "./storage";
import {
  createRunStore,
  RunStoreError,
  type RunMode,
} from "./run-store";
import type {
  SimulationAction,
  SimulationLocation,
  SimulationState,
} from "./types";

function subscribeHydration() {
  return () => undefined;
}

function getClientHydrationSnapshot() {
  return true;
}

function getServerHydrationSnapshot() {
  return false;
}

type SimulationContextValue = {
  ready: boolean;
  state: SimulationState;
  dispatch: (action: SimulationAction) => void;
  resetRun: () => void;
  pending: boolean;
  error: string | null;
  mode: RunMode;
};

const SimulationContext = createContext<SimulationContextValue | null>(null);

export function SimulationProvider({
  courseId,
  moduleId,
  scenario,
  mode = "demo",
  children,
}: {
  courseId: string;
  moduleId: string;
  scenario: Scenario;
  mode?: RunMode;
  children: ReactNode;
}) {
  const location = useMemo<SimulationLocation>(
    () => ({ courseId, moduleId, scenario }),
    [courseId, moduleId, scenario],
  );
  const fallback = useMemo(
    () => resetSimulation(location),
    [location],
  );
  const [state, setState] = useState<SimulationState>(
    () => (mode === "demo" ? loadActiveState(scenario.id) : null) ?? fallback,
  );
  const stateRef = useRef(state);
  const dispatchQueue = useRef(Promise.resolve());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedReady, setConnectedReady] = useState(mode === "demo");
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
  const ready = mode === "demo" ? hydrated : connectedReady;
  const store = useMemo(
    () =>
      createRunStore({
        mode,
        scenarioId: scenario.id,
        location,
        initial: fallback,
      }),
    [fallback, location, mode, scenario.id],
  );

  useEffect(() => {
    stateRef.current = state;
    if (ready && mode === "demo") persistState(state);
  }, [mode, ready, state]);

  useEffect(() => {
    if (mode !== "connected") return;
    let active = true;
    store
      .load()
      .then((loaded) => {
        if (!active || !loaded) return;
        stateRef.current = loaded;
        setState(loaded);
      })
      .catch((cause) => {
        if (active) {
          setError(
            cause instanceof RunStoreError
              ? cause.message
              : "Could not load the connected run.",
          );
        }
      })
      .finally(() => {
        if (active) setConnectedReady(true);
      });
    return () => {
      active = false;
    };
  }, [mode, store]);

  const dispatch = useCallback(
    (action: SimulationAction) => {
      setError(null);
      setPending(true);
      dispatchQueue.current = dispatchQueue.current
        .then(async () => {
          const next = await store.execute(stateRef.current, action);
          stateRef.current = next;
          setState(next);
        })
        .catch((cause) => {
          setError(
            cause instanceof RunStoreError
              ? cause.message
              : "The run could not be updated.",
          );
        })
        .finally(() => setPending(false));
    },
    [store],
  );

  const resetRun = useCallback(() => {
    setError(null);
    setPending(true);
    dispatchQueue.current = dispatchQueue.current
      .then(async () => {
        const next = await store.reset();
        stateRef.current = next;
        setState(next);
      })
      .catch((cause) => {
        setError(
          cause instanceof RunStoreError
            ? cause.message
            : "The run could not be reset.",
        );
      })
      .finally(() => setPending(false));
  }, [store]);

  const value = useMemo(
    () => ({ ready, state, dispatch, resetRun, pending, error, mode }),
    [dispatch, error, mode, pending, ready, resetRun, state],
  );

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation(): SimulationContextValue {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation must be used inside SimulationProvider");
  }
  return context;
}
