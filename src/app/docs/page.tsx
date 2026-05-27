import fs from "fs";
import path from "path";
import { DocsLayoutClient } from "./docs-layout-client";

export const dynamic = "force-static";

export default function DocsPage() {
  const dir = path.join(process.cwd(), "src/app/docs/markdown");
  const apiContent = fs.readFileSync(path.join(dir, "API.md"), "utf-8");
  const createEventContent = fs.readFileSync(path.join(dir, "CREATE-EVENT.md"), "utf-8");
  const createSpotContent = fs.readFileSync(path.join(dir, "CREATE-SPOT.md"), "utf-8");
  const implementationContent = fs.readFileSync(path.join(dir, "IMPLEMENTATION.md"), "utf-8");

  return (
    <DocsLayoutClient
      apiContent={apiContent}
      createEventContent={createEventContent}
      createSpotContent={createSpotContent}
      implementationContent={implementationContent}
    />
  );
}
