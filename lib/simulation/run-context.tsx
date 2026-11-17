"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Scenario } from "@/content/types";
import { resetSimulation } from "./state";
import { simulationReducer } from "./reducer";
import { loadActiveState, persistState } from "./storage";
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
};

const SimulationContext = createContext<SimulationContextValue | null>(null);

export function SimulationProvider({
  courseId,
  moduleId,
  scenario,
  children,
}: {
  courseId: string;
  moduleId: string;
  scenario: Scenario;
  children: ReactNode;
}) {
  const location = useMemo<SimulationLocation>(
    () => ({ courseId, moduleId, scenario }),
    [courseId, moduleId, scenario],
  );
  const [state, setState] = useState<SimulationState>(
    () => loadActiveState(scenario.id) ?? resetSimulation(location),
  );
  const ready = useSyncExternalStore(
    subscribeHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );

  useEffect(() => {
    if (ready) persistState(state);
  }, [ready, state]);

  const dispatch = useCallback((action: SimulationAction) => {
    setState((current) =>
      simulationReducer(current, {
        ...action,
        at: action.at ?? new Date().toISOString(),
      }),
    );
  }, []);

  const resetRun = useCallback(() => {
    setState(resetSimulation(location));
  }, [location]);

  const value = useMemo(
    () => ({ ready, state, dispatch, resetRun }),
    [ready, state, dispatch, resetRun],
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
