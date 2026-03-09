import { readFileSync } from "fs";
import { join } from "path";
import { DocsLayoutClient } from "./docs-layout-client";

export const dynamic = "force-static";

const MARKDOWN_DIR = join(process.cwd(), "src", "app", "docs", "markdown");

function readMarkdown(filename: string): string {
  return readFileSync(join(MARKDOWN_DIR, filename), "utf-8");
}

export default function DocsPage() {
  const apiContent = readMarkdown("API.md");
  const createEventContent = readMarkdown("CREATE-EVENT.md");
  const createSpotContent = readMarkdown("CREATE-SPOT.md");
  const implementationContent = readMarkdown("IMPLEMENTATION.md");

  return (
    <DocsLayoutClient
      apiContent={apiContent}
      createEventContent={createEventContent}
      createSpotContent={createSpotContent}
      implementationContent={implementationContent}
    />
  );
}
