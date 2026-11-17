"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  getServerRunRecordsSnapshot,
  loadRunRecords,
  subscribeRunRecords,
} from "./storage";
import type { RunRecord } from "./types";

export function useRunRecords(): RunRecord[] {
  const local = useSyncExternalStore(
    subscribeRunRecords,
    loadRunRecords,
    getServerRunRecordsSnapshot,
  );
  const [remote, setRemote] = useState<RunRecord[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/runs", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { records?: RunRecord[] }) => {
        if (active) setRemote(payload.records ?? []);
      })
      .catch(() => {
        if (active) setRemote([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return useMemo(() => {
    const byId = new Map<string, RunRecord>();
    for (const record of [...local, ...remote]) byId.set(record.runId, record);
    return [...byId.values()].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
  }, [local, remote]);
}

export function useRunRecord(runId: string): RunRecord | null {
  const localRecord =
    useRunRecords().find((record) => record.runId === runId) ?? null;
  const [remoteRecord, setRemoteRecord] = useState<RunRecord | null>(null);

  useEffect(() => {
    if (localRecord) return;
    let active = true;
    fetch(`/api/runs/history/${runId}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { record?: RunRecord } | null) => {
        if (active) setRemoteRecord(payload?.record ?? null);
      })
      .catch(() => {
        if (active) setRemoteRecord(null);
      });
    return () => {
      active = false;
    };
  }, [localRecord, runId]);

  return localRecord ?? remoteRecord;
}
