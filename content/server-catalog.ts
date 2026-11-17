import "server-only";

import {
  getCourse,
  getModule,
  getScenario,
  courses,
} from "./courses";
import {
  toPublicCourse,
  toPublicScenario,
  workspaceHref,
  type PublicCourse,
  type PublicScenario,
} from "./public-catalog";
import {
  CourseConfigSchema,
  type Course,
  type Module,
  type Scenario,
} from "./types";

export const publicCourses: PublicCourse[] = courses.map(toPublicCourse);
export const publicCatalogValidation = CourseConfigSchema.safeParse(courses);

export function getServerCourse(courseId: string): Course | undefined {
  return getCourse(courseId);
}

export function getServerModule(
  courseId: string,
  moduleId: string,
): Module | undefined {
  return getModule(courseId, moduleId);
}

export function getServerScenario(
  courseId: string,
  moduleId: string,
  scenarioId: string,
): Scenario | undefined {
  return getScenario(courseId, moduleId, scenarioId);
}

export function getServerScenarioById(scenarioId: string): {
  course: Course;
  module: Module;
  scenario: Scenario;
} | null {
  for (const course of courses) {
    for (const learningModule of course.modules) {
      const scenario = learningModule.scenarios.find(
        (item) => item.id === scenarioId,
      );
      if (scenario) return { course, module: learningModule, scenario };
    }
  }
  return null;
}

export function toClientScenario(scenario: Scenario): PublicScenario {
  return toPublicScenario(scenario);
}

export function toConnectedClientScenario(scenario: Scenario): Scenario {
  return {
    ...toPublicScenario(scenario),
    initialFiles: scenario.initialFiles.map((file) => ({
      path: file.path,
      name: file.name,
      language: file.language,
      initialContent: file.initialContent,
      aiContent: "",
      fixedContent: "",
    })),
  };
}

export function getScenarioHref(
  course: Course,
  module: Module,
  scenario: Scenario,
) {
  return workspaceHref(course, module, scenario);
}
