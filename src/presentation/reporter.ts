import { Awaitable, File, Reporter, Task } from "vitest";
import { Processor, Task as ProcessorTask } from "../processor";
import { NotionConfig, NotionPageRepository } from "../repositories/notion.page.repository";

export class NotionReporter implements Reporter {
  private readonly processor: Processor;

  private static extractConfig(config: Partial<NotionConfig>): NotionConfig {
    const token = config.token ?? process.env.NOTION_TOKEN;
    const parentPageId = config.parentPageId ?? process.env.NOTION_PARENT_PAGE_ID;

    if (!token) {
      throw new Error("Notion token is not set!")
    }

    if (!parentPageId) {
      throw new Error("Notion parent page id is not set!")
    }

    return {
      parentPageId,
      token,
    }
  }

  constructor(config: Partial<NotionConfig>) {
    this.processor = new Processor(
      new NotionPageRepository(NotionReporter.extractConfig(config))
    )
  }

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
