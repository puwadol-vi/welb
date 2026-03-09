import { DocsLayoutClient } from "./docs-layout-client";

import apiContent from "./markdown/API.md";
import createEventContent from "./markdown/CREATE-EVENT.md";
import createSpotContent from "./markdown/CREATE-SPOT.md";
import implementationContent from "./markdown/IMPLEMENTATION.md";

export const dynamic = "force-static";

export default function DocsPage() {
  return (
    <DocsLayoutClient
      apiContent={apiContent}
      createEventContent={createEventContent}
      createSpotContent={createSpotContent}
      implementationContent={implementationContent}
    />
  );
}
