import { defineConfig, UserWorkspaceConfig } from "vitest/config";
import { NotionReporter } from "./dist/src/presentation/reporter";

export default defineConfig(<UserWorkspaceConfig>{
  test: {
    include: ["test/**/*.spec.ts"],
    sequence: {
      hooks: "list",
    },
    server: {
      deps: { inline: ["loglevel"] },
    },
    environment: "node",
    outputFile: "junit.xml",
    reporters: ["junit", "default", new NotionReporter()],
    coverage: {
      include: ["src/**/*"],
      exclude: ["src/repositories/**/*", "src/presentation/**/*"],
      all: false,
      branches: 90,
      functions: 90,
      lines: 90,
      reporter: ["cobertura", "clover", "text"],
      statements: 90,
    },
  },
});
