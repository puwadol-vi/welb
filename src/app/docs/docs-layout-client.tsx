"use client";

import { useState } from "react";
import { FileText, Calendar, MapPin, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const articleClass =
  " [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:border-b [&_h1]:border-border [&_h1]:pb-2 " +
  " [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3 " +
  " [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 " +
  " [&_p]:my-2 [&_p]:text-muted-foreground " +
  " [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_table]:rounded-lg [&_table]:border [&_table]:border-border " +
  " [&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-sm [&_th]:font-medium " +
  " [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm " +
  " [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_li]:my-0.5 " +
  " [&_hr]:my-8 [&_hr]:border-border " +
  " text-foreground";

export function MarkdownViewer({ content }: { content: string }) {
  return (
    <article className={"max-w-none" + articleClass}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}

export type DocPartId =
  | "top"
  | "create-event"
  | "create-spot"
  | "implementation";

const SIDEBAR_ITEMS: {
  id: DocPartId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "top", label: "Overview", icon: FileText },
  { id: "create-event", label: "Create Event", icon: Calendar },
  { id: "create-spot", label: "Create Spot", icon: MapPin },
  { id: "implementation", label: "Implementation Plan", icon: LayoutDashboard },
];

type Props = {
  apiContent: string;
  createEventContent: string;
  createSpotContent: string;
  implementationContent: string;
};

export function DocsLayoutClient({
  apiContent,
  createEventContent,
  createSpotContent,
  implementationContent,
}: Props) {
  const [selected, setSelected] = useState<DocPartId>("top");

  const contentMap = {
    top: apiContent,
    "create-event": createEventContent,
    "create-spot": createSpotContent,
    implementation: implementationContent,
  };

  const content = contentMap[selected];

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-56 shrink-0 border-r border-border bg-card/30 p-4">
        <nav className="space-y-0.5" aria-label="Docs sections">
          {SIDEBAR_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSelected(id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                selected === id
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <MarkdownViewer content={content} />
        </div>
      </main>
    </div>
  );
}
