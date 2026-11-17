import { z } from "zod";
import type { SimulationAction } from "./types";

const modeSchema = z.enum(["ask", "plan", "build"]);
const environmentSchema = z.enum(["local", "production"]);

export const ClientSimulationActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("OPEN_EMAIL"), emailId: z.string().trim().min(1).max(200) }),
  z.object({ type: z.literal("SAVE_NOTES"), content: z.string().max(12_000) }),
  z.object({ type: z.literal("SET_ASSISTANT_MODE"), mode: modeSchema }),
  z.object({ type: z.literal("SEND_ASSISTANT"), prompt: z.string().trim().min(1).max(4_000) }),
  z.object({ type: z.literal("APPLY_AI_EDIT") }),
  z.object({ type: z.literal("RUN_TESTS") }),
  z.object({ type: z.literal("APPLY_FIX") }),
  z.object({ type: z.literal("STAGE_ALL") }),
  z.object({ type: z.literal("COMMIT"), message: z.string().trim().min(1).max(200) }),
  z.object({ type: z.literal("OPEN_PR") }),
  z.object({ type: z.literal("REQUEST_CHANGES") }),
  z.object({ type: z.literal("APPROVE_PR") }),
  z.object({ type: z.literal("SET_ENVIRONMENT"), environment: environmentSchema }),
  z.object({ type: z.literal("PUBLISH") }),
  z.object({ type: z.literal("SAVE_SUMMARY"), content: z.string().max(30_000) }),
]);

export type ClientSimulationAction = z.infer<
  typeof ClientSimulationActionSchema
>;

export const RunCommandSchema = z.discriminatedUnion("command", [
  z.object({ command: z.literal("dispatch"), action: ClientSimulationActionSchema }),
  z.object({ command: z.literal("reset") }),
]);

export type RunCommand = z.infer<typeof RunCommandSchema>;

export function toSimulationAction(
  action: ClientSimulationAction,
): SimulationAction {
  return action;
}
