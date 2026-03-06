import { digitalContent } from "@/lib/mock-data"
import { Video, BookOpen, Presentation, FileText, ExternalLink } from "lucide-react"

const contentTypeIcons: Record<string, typeof Video> = {
  Video: Video,
  "E-book": BookOpen,
  Slide: Presentation,
  Article: FileText,
}

const contentTypeColors: Record<string, string> = {
  Video: "bg-red-500/15 text-red-400",
  "E-book": "bg-blue-500/15 text-blue-400",
  Slide: "bg-amber-500/15 text-amber-400",
  Article: "bg-emerald-500/15 text-emerald-400",
}

export default function DigitalPage() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      {/* Header */}
      <header>
        <h1 className="text-xl font-bold text-foreground">Digital Content</h1>
        <p className="text-xs text-muted-foreground">Learn from the Bitcoin community</p>
      </header>

      {/* Content list */}
      <div className="flex flex-col gap-3">
        {digitalContent.map((item) => {
          const Icon = contentTypeIcons[item.contentType] || FileText
          const colorClass = contentTypeColors[item.contentType] || "bg-secondary text-secondary-foreground"
          return (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
            >
              {/* Preview placeholder */}
              <div className="flex aspect-video items-center justify-center rounded-lg bg-secondary">
                <Icon className="h-10 w-10 text-muted-foreground/30" />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${colorClass}`}>
                    <Icon className="h-3 w-3" />
                    {item.contentType}
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                    {item.category}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {"Created by "}
                  <span className="font-semibold text-foreground">{item.creatorName}</span>
                </p>
              </div>

              <a
                href={item.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
              >
                View Original
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )
        })}
      </div>
    </div>
  )
}
