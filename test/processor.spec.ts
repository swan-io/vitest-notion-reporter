import { randomUUID } from "crypto";
import { beforeAll, describe, expect, it } from "vitest";
import { Page, Processor, Task } from "../src/processor";
import { InMemoryPageRepository } from "./repositories/in-memory.page.repository";

describe("Create documentation from tests", () => {
  let promise: Promise<void>;
  let pageRepository: InMemoryPageRepository;

  describe("when there's one use case", () => {
    describe("when there's one case", () => {
      describe("when there's one expectation", () => {
        const tasks: Task[] = [
          {
            name: "Feature 1",
            tasks: [
              {
                name: "Case 1",
                tasks: [
                  {
                    name: "Expectation 1",
                    tasks: [],
                  },
                ],
              },
            ],
          },
        ];

        beforeAll(() => setup(tasks));

        it("should create a page", async () => {
          await promise;

          expect(pageRepository.pages).toHaveLength(1);
        });

        it("should name the page after the main describe", async () => {
          await promise;

          expect(pageRepository.pages).toEqual([
            expect.objectContaining({
              name: "Feature 1",
            }),
          ]);
        });

        it("should set the case and one expectation as content ", async () => {
          await promise;

          expect(pageRepository.pages).toEqual([
            expect.objectContaining({
              content: "Case 1\n  Expectation 1",
            }),
          ]);
        });
      });

      describe("when there are two expectations", () => {
        const tasks: Task[] = [
          {
            name: "Feature 1",
            tasks: [
              {
                name: "Case 1",
                tasks: [
                  {
                    name: "Expectation 1",
                    tasks: [],
                  },
                  {
                    name: "Expectation 2",
                    tasks: [],
                  },
                ],
              },
            ],
          },
        ];

        beforeAll(() => setup(tasks));

        it("should set the case and two expectations as content ", async () => {
          await promise;

          expect(pageRepository.pages).toEqual([
            expect.objectContaining({
              content: "Case 1\n  Expectation 1\n  Expectation 2",
            }),
          ]);
        });
      });
    });

    describe("when there are two cases", () => {
      const tasks: Task[] = [
        {
          name: "Feature 1",
          tasks: [
            {
              name: "Case 1",
              tasks: [],
            },
            {
              name: "Case 2",
              tasks: [],
            },
          ],
        },
      ];

      beforeAll(() => setup(tasks));

      it("should set two cases as content ", async () => {
        await promise;

        expect(pageRepository.pages).toEqual([
          expect.objectContaining({
            content: `Case 1\nCase 2`,
          }),
        ]);
      });
    });
  });

  describe("when there's two use cases", () => {
    const tasks: Task[] = [
      {
        name: "Feature 1",
        tasks: [],
      },
      {
        name: "Feature 2",
        tasks: [],
      },
    ];

    beforeAll(() => setup(tasks));

    it("should create two pages", async () => {
      await promise;

      expect(pageRepository.pages).toHaveLength(2);
    });
  });

  describe("when page already exists", () => {
    const id = randomUUID();
    const name = "Feature 1";
    const tasks: Task[] = [
      {
        name,
        tasks: [
          {
            name: "Case 1",
            tasks: [],
          },
        ],
      },
    ];

    beforeAll(() =>
      setup(tasks, {
        pages: [
          {
            id,
            name,
            content: "",
          },
        ],
      }),
    );

    it("should update the existing page", async () => {
      await promise;

      expect(pageRepository.pages).toEqual([
        expect.objectContaining({
          content: "Case 1",
        }),
      ]);
    });
  });

  function setup(
    tasks: Task[],
    givens: {
      pages?: Page[];
    } = {},
  ): void {
    pageRepository = new InMemoryPageRepository(givens.pages);

    const main = new Processor(pageRepository);

    promise = main.execute(tasks);
  }
});
