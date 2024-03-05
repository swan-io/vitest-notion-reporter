# vitest-notion-reporter

Eager to make your unit tests a source of documentation for everyone in your company? Here comes a vitest reporter that creates documentation on Notion from your tests `describe`s and `it`s :rocket:

## Installation

```bash
npm install -D @swan-io/vitest-notion-reporter
```

## Usage

### Add the reporter to your vitest configuration

```ts
import { defineConfig, UserWorkspaceConfig } from "vitest/config";
import { NotionReporter } from "@swan-io/vitest-notion-reporter";

export default defineConfig(<UserWorkspaceConfig>{
  test: {
    reporters: [new NotionReporter()],
  },
});
```

### Configuration

```bash
export NOTION_TOKEN=<YOUR-NOTION-TOKEN>
export NOTION_PARENT_PAGE_ID=<ROOT-PAGE-FOR-DOCUMENTATION-ID>
```

or

```ts
import { defineConfig, UserWorkspaceConfig } from "vitest/config";
import { NotionReporter } from "@swan-io/vitest-notion-reporter";

export default defineConfig(<UserWorkspaceConfig>{
  test: {
    reporters: [new NotionReporter({
      token: "<YOUR-NOTION-TOKEN>",
      parentPageId: "<ROOT-PAGE-FOR-DOCUMENTATION-ID>"
    })],
  },
});
```

## License
GPL >=3.0
