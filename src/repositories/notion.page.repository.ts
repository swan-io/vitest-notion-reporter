import { Page } from "../processor";
import { PageRepository } from "./page-repository.gateway";

type NotionChild = {
  object: "block";
  type: "code";
  code: {
    rich_text: Array<{
      text: { content: string };
    }>;
    language: "javascript";
  };
};

type NotionData = {
  parent: {
    page_id: string;
  };
  properties: {
    title: {
      title: Array<{
        type: "text";
        text: {
          content: string;
        };
      }>;
    };
  };
  children: NotionChild[];
};

type NotionSearchResult = {
  results: Array<{
    id: string;
    properties: {
      title: { title: { plain_text: string }[] };
    };
  }>;
};

export class NotionPageRepository implements PageRepository {
  private static async wrappedFetch(
    fetch: Promise<Response>,
  ): Promise<Response> {
    const response = await fetch;

    const status = response.status;

    if (status !== 200) {
      const body = await response.json();

      throw new Error(`Status is ${status}, not 200 (${JSON.stringify(body)})`);
    }

    return response;
  }

  private static mapToNotionChild(content: string): NotionChild {
    return {
      object: "block",
      type: "code",
      code: {
        language: "javascript",
        rich_text: [
          {
            text: {
              content,
            },
          },
        ],
      },
    };
  }

  private static mapInputToNotion(page: Page): NotionData {
    if (!process.env.NOTION_PARENT_PAGE_ID) {
      throw new Error("NOTION_PARENT_PAGE_ID is not set!");
    }

    return {
      parent: {
        page_id: process.env.NOTION_PARENT_PAGE_ID,
      },
      properties: {
        title: {
          title: [
            {
              type: "text",
              text: {
                content: page.name,
              },
            },
          ],
        },
      },
      children: [NotionPageRepository.mapToNotionChild(page.content)],
    };
  }

  private post(url: string, body: any): Promise<Response> {
    return NotionPageRepository.wrappedFetch(
      fetch(url, {
        ...this.getHeaders(),
        method: "POST",
        body: JSON.stringify(body),
      }),
    );
  }

  private get(url: string): Promise<Response> {
    return NotionPageRepository.wrappedFetch(
      fetch(url, {
        ...this.getHeaders(),
        method: "GET",
      }),
    );
  }

  private patch(url: string, body: any): Promise<Response> {
    return NotionPageRepository.wrappedFetch(
      fetch(url, {
        ...this.getHeaders(),
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    );
  }

  private getHeaders(): { headers: HeadersInit } {
    if (!process.env.NOTION_TOKEN) {
      throw new Error("NOTION_TOKEN is not set!");
    }

    return {
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
    };
  }

  async create(page: Page): Promise<void> {
    await this.post(
      "https://api.notion.com/v1/pages",
      NotionPageRepository.mapInputToNotion(page),
    );

    return;
  }

  async findIdByName(query: string): Promise<string | undefined> {
    const searchPageByNameResponse = await this.post(
      "https://api.notion.com/v1/search",
      { query },
    );

    const pages: NotionSearchResult = await searchPageByNameResponse.json();

    return pages.results.find((result) =>
      result.properties.title.title.find(
        ({ plain_text }) => plain_text === query,
      ),
    )?.id;
  }

  async update(page: Page): Promise<void> {
    const getBlockByIdResponse = await this.get(
      `https://api.notion.com/v1/blocks/${page.id}/children`,
    );

    const blocks: NotionSearchResult = await getBlockByIdResponse.json();

    const blockId = blocks.results[0]?.id;

    if (!blockId) {
      await this.patch(`https://api.notion.com/v1/blocks/${page.id}/children`, {
        children: [NotionPageRepository.mapToNotionChild(page.content)],
      });
    } else {
      await this.patch(
        `https://api.notion.com/v1/blocks/${blockId}`,
        NotionPageRepository.mapToNotionChild(page.content),
      );
    }

    return;
  }
}
