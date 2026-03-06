import type { SpotModel, Event } from "@/types";
import { getActiveSpots, getSuggestSpots } from "./spot";

export interface HomePageData {
  stats: {
    shopCount: number;
    provinceCount: number;
  };
  upcomingEvents: Event[];
  topSpots: SpotModel[];
}

const emptyData: HomePageData = {
  stats: { shopCount: 0, provinceCount: 0 },
  upcomingEvents: [],
  topSpots: [],
};

export async function getHomePageData(): Promise<HomePageData> {
  try {
    const topSpots = await getSuggestSpots();
    const activeSpots = await getActiveSpots();
    const shopCount = activeSpots.length;
    const provinces = new Set(activeSpots.map((s) => s.province));
    return {
      stats: { shopCount, provinceCount: provinces.size },
      upcomingEvents: [],
      topSpots,
    };
  } catch {
    return emptyData;
  }
}
