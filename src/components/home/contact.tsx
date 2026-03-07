import Link from "next/link";
import { Map, Facebook, MessageCircle, MessageSquare } from "lucide-react";

const links = [
  {
    label: "BTC Map",
    href: "https://btcmap.org/map",
    icon: Map,
    description: "Bitcoin merchant map",
  },
  {
    label: "Facebook",
    href: "https://web.facebook.com/profile.php?id=61565666237038",
    icon: Facebook,
    description: "Wel B",
  },
  {
    label: "LINE OpenChat",
    href: "https://line.me/ti/g2/rTb8XRwNI_dsJ79oIIyzpSOOWJozgvUCPpY9Vw",
    icon: MessageCircle,
    description: "ร้านค้ารับบิตคอยน์",
  },
  {
    label: "Discord",
    href: "https://discord.com/invite/hv6Mkzed9n",
    icon: MessageSquare,
    description: "WelB Lightning Merchant",
  },
] as const;

export function Contact() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {links.map(({ label, href, icon: Icon, description }) => (
        <Link
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 rounded-xl border border-border bg-card/50 p-4 transition-colors hover:border-primary/40 hover:bg-card"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <span className="font-medium text-foreground">{label}</span>
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
              {description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
