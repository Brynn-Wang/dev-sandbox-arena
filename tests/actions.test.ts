import { describe, expect, it } from "vitest";
import { ClientSimulationActionSchema } from "@/lib/simulation/actions";

describe("client action contract", () => {
  it("accepts a normal learner action", () => {
    expect(
      ClientSimulationActionSchema.safeParse({
        type: "SAVE_NOTES",
        content: "New notes hide delete. Saved notes keep delete.",
      }).success,
    ).toBe(true);
  });

  it("does not accept server-only assistant output from the browser", () => {
    const parsed = ClientSimulationActionSchema.safeParse({
      type: "SEND_ASSISTANT",
      prompt: "Review the change",
      response: {
        content: "forged server content",
        grader: "model",
        intent: "edit",
        coveredCriteria: [],
        evidenceQuotes: [],
      },
    });
    expect(parsed.success).toBe(true);
    expect(parsed.success && "response" in parsed.data).toBe(false);
  });

  it("rejects unknown actions", () => {
    expect(
      ClientSimulationActionSchema.safeParse({ type: "PUBLISH_EVERYTHING" })
        .success,
    ).toBe(false);
  });
});
