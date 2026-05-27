"use client";

import { useState } from "react";
import {
  FileText,
  MapPin,
  LayoutDashboard,
  Search,
  Eye,
  Pencil,
  Upload,
  PlusCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
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
  | "overview"
  | "implementation"
  | "createEvent"
  | "getEvents"
  | "getEvent"
  | "patchEvent"
  | "createSpot"
  | "getSpots"
  | "uploadImage";

type SidebarItem = {
  id: DocPartId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type SidebarGroup = {
  group: string;
  items: SidebarItem[];
};

type SidebarSection = {
  section: string;
};

const SIDEBAR: (SidebarItem | SidebarGroup | SidebarSection)[] = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "implementation", label: "Implementation Plan", icon: LayoutDashboard },
  { section: "API" },
  {
    group: "Events",
    items: [
      { id: "createEvent", label: "Create Event", icon: PlusCircle },
      { id: "getEvents", label: "List Events", icon: Search },
      { id: "getEvent", label: "Get Event", icon: Eye },
      { id: "patchEvent", label: "Update Event", icon: Pencil },
    ],
  },
  {
    group: "Spots",
    items: [
      { id: "createSpot", label: "Create Spot", icon: MapPin },
      { id: "getSpots", label: "List Spots", icon: Search },
    ],
  },
  { id: "uploadImage", label: "Upload Image", icon: Upload },
];

type Docs = Record<DocPartId, string>;

function isGroup(entry: SidebarItem | SidebarGroup | SidebarSection): entry is SidebarGroup {
  return "group" in entry;
}

function isSection(entry: SidebarItem | SidebarGroup | SidebarSection): entry is SidebarSection {
  return "section" in entry;
}

function SidebarButton({
  item,
  selected,
  onSelect,
  indent = false,
}: {
  item: SidebarItem;
  selected: DocPartId;
  onSelect: (id: DocPartId) => void;
  indent?: boolean;
}) {
  const Icon = item.icon;
  return (
    <button
      key={item.id}
      type="button"
      onClick={() => onSelect(item.id)}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg py-1.5 text-left text-sm font-medium transition-colors",
        indent ? "pl-5 pr-3" : "px-3",
        selected === item.id
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {item.label}
    </button>
  );
}

export function DocsLayoutClient({ docs }: { docs: Docs }) {
  const [selected, setSelected] = useState<DocPartId>("overview");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function toggleGroup(group: string) {
    setCollapsed((prev) => ({ ...prev, [group]: !prev[group] }));
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-56 shrink-0 border-r border-border bg-card/30 p-4">
        <nav className="space-y-0.5" aria-label="Docs sections">
          {SIDEBAR.map((entry) => {
            if (isSection(entry)) {
              return (
                <div key={entry.section} className="pt-5">
                  <div className="mb-2 flex items-center gap-2 px-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">
                      {entry.section}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                </div>
              );
            }
            if (isGroup(entry)) {
              const isCollapsed = !!collapsed[entry.group];
              return (
                <div key={entry.group} className="pt-1">
                  <button
                    type="button"
                    onClick={() => toggleGroup(entry.group)}
                    className="mb-0.5 flex w-full items-center gap-1 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 hover:text-muted-foreground"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-3 w-3 shrink-0" />
                    ) : (
                      <ChevronDown className="h-3 w-3 shrink-0" />
                    )}
                    {entry.group}
                  </button>
                  {!isCollapsed && (
                    <div className="space-y-0.5">
                      {entry.items.map((item) => (
                        <SidebarButton
                          key={item.id}
                          item={item}
                          selected={selected}
                          onSelect={setSelected}
                          indent
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <SidebarButton
                key={entry.id}
                item={entry}
                selected={selected}
                onSelect={setSelected}
              />
            );
          })}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <MarkdownViewer content={docs[selected]} />
        </div>
      </main>
    </div>
  );
}
