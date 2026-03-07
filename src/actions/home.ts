import type { SpotModel, EventModel } from "@/types";
import { getActiveSpots, getSuggestSpots } from "./spot";
import { getHighlightEvents, getWelbEvents } from "./event";

export interface HomePageData {
  stats: {
    shopCount: number;
    provinceCount: number;
  };
  highlightEvents: EventModel[];
  welbEvents: EventModel[];
  topSpots: SpotModel[];
}

const emptyData: HomePageData = {
  stats: { shopCount: 0, provinceCount: 0 },
  welbEvents: [],
  highlightEvents: [],
  topSpots: [],
};

export async function getHomePageData(): Promise<HomePageData> {
  try {
    const topSpots = await getSuggestSpots();
    const activeSpots = await getActiveSpots();
    const shopCount = activeSpots.length;
    const provinces = new Set(activeSpots.map((s) => s.province));
    const welbEvents = await getWelbEvents();
    const highlightEvents = await getHighlightEvents();

    return {
      stats: { shopCount, provinceCount: provinces.size },
      welbEvents: welbEvents.upcomingEvents,
      highlightEvents: highlightEvents,
      topSpots,
    };
  } catch {
    return emptyData;
  }
}
