import fs from "fs";
import path from "path";
import { DocsLayoutClient } from "./docs-layout-client";

export const dynamic = "force-static";

export default function DocsPage() {
  const dir = path.join(process.cwd(), "ai/docs");
  const eventDir = path.join(dir, "event");
  const spotDir = path.join(dir, "spot");
  const utilityDir = path.join(dir, "utilities");

  function read(filePath: string) {
    return fs.readFileSync(filePath, "utf-8");
  }

  const docs = {
    overview: read(path.join(dir, "API.md")),
    implementation: read(path.join(dir, "IMPLEMENTATION.md")),
    createEvent: read(path.join(eventDir, "CREATE-EVENT.md")),
    getEvents: read(path.join(eventDir, "GET-EVENTS.md")),
    getEvent: read(path.join(eventDir, "GET-EVENT.md")),
    patchEvent: read(path.join(eventDir, "PATCH-EVENT.md")),
    createSpot: read(path.join(spotDir, "CREATE-SPOT.md")),
    getSpots: read(path.join(spotDir, "GET-SPOTS.md")),
    uploadImage: read(path.join(utilityDir, "UPLOAD-IMAGE.md")),
  };

  return <DocsLayoutClient docs={docs} />;
}
