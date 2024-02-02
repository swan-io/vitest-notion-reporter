import { Page } from "../processor";

export interface PageRepository {
  create(page: Omit<Page, "id">): Promise<void>;

  findIdByName(name: string): Promise<string | undefined>;

  update(page: Page): Promise<void>;
}
