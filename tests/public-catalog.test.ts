import { describe, expect, it } from "vitest";
import { courses } from "@/content/courses";
import { toPublicCourse } from "@/content/public-catalog";

describe("public catalog boundary", () => {
  const publicCourses = courses.map(toPublicCourse);

  it("does not expose solution variants or hidden test content", () => {
    const catalog = JSON.stringify(publicCourses);
    expect(catalog).not.toContain("aiContent");
    expect(catalog).not.toContain("fixedContent");
    expect(catalog).not.toContain("noteId === null");
  });

  it("retains the information needed by catalog pages", () => {
    const scenario = publicCourses[0].modules[0].scenarios[0];
    expect(scenario.title.zh).toBeTruthy();
    expect(scenario.taskSteps.length).toBeGreaterThan(0);
    expect(scenario.completionConditions.length).toBeGreaterThan(0);
  });
});
