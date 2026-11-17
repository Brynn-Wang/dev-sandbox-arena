import { simulationReducer } from "./reducer";
import { resetSimulation } from "./state";
import { persistState } from "./storage";
import type {
  SimulationAction,
  SimulationLocation,
  SimulationState,
} from "./types";

export type RunMode = "demo" | "connected";

export interface RunStore {
  mode: RunMode;
  load(): Promise<SimulationState | null>;
  execute(
    current: SimulationState,
    action: SimulationAction,
  ): Promise<SimulationState>;
  reset(): Promise<SimulationState>;
}

class LocalRunStore implements RunStore {
  mode = "demo" as const;

  constructor(
    private readonly location: SimulationLocation,
    private readonly initial: SimulationState,
  ) {}

  async load() {
    return this.initial;
  }

  async execute(current: SimulationState, action: SimulationAction) {
    const next = simulationReducer(current, {
      ...action,
      at: action.at ?? new Date().toISOString(),
    });
    persistState(next);
    return next;
  }

  async reset() {
    const next = resetSimulation(this.location);
    persistState(next);
    return next;
  }
}

export class RunStoreError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
  }
}

class ConnectedRunStore implements RunStore {
  mode = "connected" as const;

  constructor(private readonly scenarioId: string) {}

  async load() {
    const response = await fetch(`/api/runs/${this.scenarioId}`, {
      cache: "no-store",
    });
    const payload = await this.read(response);
    return (payload.view?.state as SimulationState | undefined) ?? null;
  }

  async execute(_current: SimulationState, action: SimulationAction) {
    const response = await fetch(`/api/runs/${this.scenarioId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: "dispatch", action }),
    });
    const payload = await this.read(response);
    if (!payload.view?.state) {
      throw new RunStoreError("Connected run response was empty.");
    }
    return payload.view.state as SimulationState;
  }

  async reset() {
    const response = await fetch(`/api/runs/${this.scenarioId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: "reset" }),
    });
    const payload = await this.read(response);
    if (!payload.view?.state) {
      throw new RunStoreError("Connected run reset response was empty.");
    }
    return payload.view.state as SimulationState;
  }

  private async read(response: Response) {
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      view?: { state?: SimulationState };
    };
    if (!response.ok) {
      throw new RunStoreError(
        payload.error ?? "Connected run request failed.",
        response.status,
      );
    }
    return payload;
  }
}

export function createRunStore({
  mode,
  scenarioId,
  location,
  initial,
}: {
  mode: RunMode;
  scenarioId: string;
  location: SimulationLocation;
  initial: SimulationState;
}): RunStore {
  return mode === "connected"
    ? new ConnectedRunStore(scenarioId)
    : new LocalRunStore(location, initial);
}
