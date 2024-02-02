import { Page } from "../../src/processor";
import { PageRepository } from "../../src/repositories/page-repository.gateway";

export class InMemoryPageRepository implements PageRepository {
  constructor(public readonly pages: Page[] = []) {}

  async create(page: Page): Promise<void> {
    this.pages.push(page);

    return Promise.resolve();
  }

  async findIdByName(name: string): Promise<string | undefined> {
    return Promise.resolve(this.pages.find((page) => page.name === name)?.id);
  }

  async update(page: Page): Promise<void> {
    const foundPageIndex = this.pages.findIndex(({ id }) => page.id === id);

    if (foundPageIndex > -1) {
      this.pages[foundPageIndex] = page;
    }

    return Promise.resolve();
  }
}
