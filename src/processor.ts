import { PageRepository } from "./repositories/page-repository.gateway";

export type Task = {
  name: string;
  tasks: Task[];
};

export type Page = {
  id: string;
  name: string;
  content: string;
};

export class Processor {
  constructor(private readonly documentRepository: PageRepository) {}

  private static generateLine(tasks: Task[], depth: number = 0): string {
    return tasks
      .map(
        (task) =>
          `${"  ".repeat(depth)}${task.name}\n${
            task.tasks.length > 0
              ? `${Processor.generateLine(task.tasks, depth + 1)}`
              : ""
          }`,
      )
      .join("");
  }

  async execute(tasks: Task[]): Promise<void> {
    const pages: Omit<Page, "id">[] = tasks.map(
      (task): Omit<Page, "id"> => ({
        name: task.name,
        content: Processor.generateLine(task.tasks).trim(),
      }),
    );

    for (const page of pages) {
      const id = await this.documentRepository.findIdByName(page.name);

      if (id) {
        await this.documentRepository.update({
          id,
          ...page,
        });
      } else {
        await this.documentRepository.create(page);
      }
    }

    return undefined;
  }
}
