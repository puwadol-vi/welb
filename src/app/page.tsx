import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import { getHomePageData } from "@/actions/home";
import { EventSlider } from "@/components/home/event-highlights";
import { TopBitcoinSpots } from "@/components/home/top-spots";

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

export default async function HomePage() {
  const data = await getHomePageData();

  return (
    <div className="flex flex-col">
      {/* Ambient Glow Background */}
      <div className="pointer-events-none fixed inset-0 z-[-1] bg-[radial-gradient(circle_at_50%_0%,rgba(247,147,26,0.08)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(247,147,26,0.03)_0%,transparent_30%)]" />

      {/* Hero Section */}
      <section className="px-6 pb-8 pt-15 sm:pt-20">
        <div className="mx-auto flex w-full max-w-[1140px] flex-col gap-8 md:flex-row md:items-center md:justify-between">
          {/* Hero content - left aligned on desktop, centered on mobile */}
          <div className="pl-8 max-w-[800px] text-center sm:text-left md:flex-1">
            <h1 className="mb-4 text-[clamp(3rem,7vw,5rem)] font-bold leading-[1.1] tracking-[-0.03em]">
              <span className="bg-linear-to-br from-primary to-amber-400 bg-clip-text text-transparent">
                WelB
              </span>
              <br />
              <span className="bg-linear-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                ร้านค้ารับ Bitcoin
              </span>
            </h1>

            {/* Hero subtitle */}
            <p className="mb-8 max-w-[600px] text-[clamp(0.9rem,2vw,1.35rem)] font-light leading-relaxed text-muted-foreground">
              ค้นหาร้านค้าที่รับชำระด้วย Bitcoin ทั่วประเทศไทย เชื่อมต่อชุมชน
              แลกเปลี่ยนประสบการณ์
            </p>

            {/* Hero buttons */}
            <div className="flex flex-wrap justify-center gap-4 sm:justify-start">
              <Link
                href="/spots"
                className="inline-flex items-center gap-3 rounded-full bg-linear-to-br from-primary to-orange-600 px-8 py-4 text-base font-semibold text-black shadow-[0_8px_20px_-6px_rgba(247,147,26,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-8px_rgba(247,147,26,0.4)]"
              >
                <MapPin className="h-5 w-5" />
                ค้นหาร้านค้า
              </Link>
              <a
                href="https://forms.gle/your-form-link"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/3 px-8 py-4 text-base font-semibold text-foreground backdrop-blur-[10px] transition-all duration-300 hover:border-primary hover:bg-primary/10"
              >
                <Plus className="h-5 w-5" />
                เพิ่มร้านค้าใหม่
              </a>
            </div>
          </div>

          {/* Stats - right side on md+, below hero on mobile */}
          <div className="hidden flex-col gap-6 md:flex">
            <div className="pr-8 py-6 text-center">
              <div className="font-mono text-5xl font-bold leading-none text-foreground">
                {data.stats.shopCount}+
              </div>
              <div className="mt-2 text-lg font-medium uppercase tracking-widest text-primary">
                ร้านค้า
              </div>
            </div>
            <div className="pr-8 py-6 text-center">
              <div className="font-mono text-5xl font-bold leading-none text-foreground">
                {data.stats.provinceCount}+
              </div>
              <div className="mt-2 text-lg font-medium uppercase tracking-widest text-primary">
                จังหวัดทั่วไทย
              </div>
            </div>
          </div>
        </div>

        {/* Stats for mobile - horizontal layout below hero */}
        <div className="mx-auto mt-8 grid max-w-[1140px] grid-cols-2 gap-4 md:hidden">
          <div className="px-4 py-5 text-center">
            <div className="font-mono text-4xl font-bold leading-none text-foreground">
              {data.stats.shopCount}+
            </div>
            <div className="mt-2 text-base font-medium uppercase tracking-widest text-primary">
              ร้านค้า
            </div>
          </div>
          <div className="px-4 py-5 text-center">
            <div className="font-mono text-4xl font-bold leading-none text-foreground">
              {data.stats.provinceCount}+
            </div>
            <div className="mt-2 text-base font-medium uppercase tracking-widest text-primary">
              จังหวัดทั่วไทย
            </div>
          </div>
        </div>
      </section>

      {/* Content sections */}
      <div className="flex flex-col gap-6 px-4 py-1">
        {/* WelB Events Highlights */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            WelB Events Highlights
          </h2>
          <EventSlider events={data.welbEvents} href="/welb" />
        </section>

        {/* Top Bitcoin Spots */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Top Bitcoin Spots
          </h2>
          <TopBitcoinSpots spots={data.topSpots} />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Weekly Event Highlights
          </h2>
          <EventSlider events={data.highlightEvents} href="/events" />
        </section>
      </div>
    </div>
  );
}
