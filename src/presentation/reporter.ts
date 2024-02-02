import { Awaitable, File, Reporter, Task } from "vitest";
import { Processor, Task as ProcessorTask } from "../processor";

export class NotionReporter implements Reporter {
  constructor(private readonly processor = new Processor()) {}

  private static getTasksOrEmpty(task: Task): ProcessorTask[] {
    switch(task.type) {
      case "suite":
        return task.tasks.map(NotionReporter.mapTask);
      default:
        return [];
    }
  }

  private static mapTask(task: Task): ProcessorTask {
    return {
      name: task.name,
      tasks: NotionReporter.getTasksOrEmpty(task),
    };
  }

  onFinished(files: File[] = []): Awaitable<void> {
    return this.processor.execute(
      files
        .map((file) =>
          file.tasks.map((task) => ({
            name: task.name,
            tasks: NotionReporter.getTasksOrEmpty(task),
          })),
        )
        .flat(),
    );
  }
}
