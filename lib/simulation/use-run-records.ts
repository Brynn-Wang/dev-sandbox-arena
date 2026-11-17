"use client";

import { useSyncExternalStore } from "react";
import {
  getServerRunRecordsSnapshot,
  loadRunRecords,
  subscribeRunRecords,
} from "./storage";
import type { RunRecord } from "./types";

export function useRunRecords(): RunRecord[] {
  return useSyncExternalStore(
    subscribeRunRecords,
    loadRunRecords,
    getServerRunRecordsSnapshot,
  );
}

export function useRunRecord(runId: string): RunRecord | null {
  return useRunRecords().find((record) => record.runId === runId) ?? null;
}
