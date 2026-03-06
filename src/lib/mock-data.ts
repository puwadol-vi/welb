// MOCK DATA for WelB (Thailand-focused)

export type { OnlineProduct } from "@/types/shop";
export type { Event } from "@/types/event";
export type { DigitalContent } from "@/types/digital";
export type { PulseUpdate } from "@/types";

import type {
  OnlineProduct,
  Event,
  DigitalContent,
  PulseUpdate,
} from "@/types";

export const onlineProducts: OnlineProduct[] = [
  {
    id: "1",
    title: "Bitcoin Hardware Wallet Case",
    category: "Accessories",
    price: 50000,
    currency: "SATS",
    sellerName: "Lightning Store TH",
    contactUrl: "https://t.me/lightningstore",
    imageUrl: "",
  },
  {
    id: "2",
    title: "Orange Pill T-Shirt",
    category: "Apparel",
    price: 120000,
    currency: "SATS",
    sellerName: "Bitcoin Merch Co",
    contactUrl: "https://wa.me/1234567890",
    imageUrl: "",
  },
  {
    id: "3",
    title: "Node Runner Hoodie",
    category: "Apparel",
    price: 250000,
    currency: "SATS",
    sellerName: "HODL Fashion",
    contactUrl: "https://t.me/hodlfashion",
    imageUrl: "",
  },
  {
    id: "4",
    title: "Bitcoin Mining Sticker Pack",
    category: "Stickers",
    price: 10000,
    currency: "SATS",
    sellerName: "Stacked Sats Shop",
    contactUrl: "https://wa.me/0987654321",
    imageUrl: "",
  },
  {
    id: "5",
    title: "Lightning Network Mug",
    category: "Accessories",
    price: 35000,
    currency: "SATS",
    sellerName: "Lightning Store TH",
    contactUrl: "https://t.me/lightningstore",
    imageUrl: "",
  },
  {
    id: "6",
    title: "Cold Storage Steel Plate",
    category: "Security",
    price: 500000,
    currency: "SATS",
    sellerName: "Secure Sats",
    contactUrl: "https://t.me/securesats",
    imageUrl: "",
  },
];

export const events: Event[] = [
  {
    id: "1",
    title: "Bitcoin Weekend Meetup",
    description: "Casual meetup for local bitcoiners. Bring your node!",
    isPaid: false,
    price: 0,
    currency: "SATS",
    startDate: "2026-03-01T14:00:00",
    location: "Satoshi's Coffee, Sukhumvit",
    city: "Bangkok",
    organizerName: "Bitcoin Thailand",
    registrationUrl: "https://example.com/register",
    participantCount: 42,
    isMonthly: true,
    isMarketActive: true,
    marketInfo: "Lightning Market: Stickers, T-shirts, Hardware wallets",
  },
  {
    id: "2",
    title: "Lightning Network Workshop",
    description: "Hands-on workshop: Build your first Lightning app with LDK.",
    isPaid: true,
    price: 100000,
    currency: "SATS",
    startDate: "2026-03-07T10:00:00",
    location: "Punspace Nimman",
    city: "Chiang Mai",
    organizerName: "LN Builders",
    registrationUrl: "https://example.com/register",
    participantCount: 28,
    isMonthly: false,
    isMarketActive: false,
    marketInfo: "",
  },
  {
    id: "3",
    title: "Bitcoin Conf Thailand 2026",
    description:
      "The biggest Bitcoin conference in Southeast Asia. 3 days of talks, workshops, and networking.",
    isPaid: true,
    price: 500000,
    currency: "SATS",
    startDate: "2026-04-15T09:00:00",
    location: "BITEC Convention Center",
    city: "Bangkok",
    organizerName: "BTC Asia",
    registrationUrl: "https://example.com/register",
    participantCount: 350,
    isMonthly: false,
    isMarketActive: true,
    marketInfo: "Lightning Market: Merch booths, hardware demos, art gallery",
  },
  {
    id: "4",
    title: "Bitcoin Book Club",
    description:
      "Monthly discussion of Bitcoin literature. This month: The Bitcoin Standard.",
    isPaid: false,
    price: 0,
    currency: "SATS",
    startDate: "2026-03-20T19:00:00",
    location: "Node Runner Cafe, Old City",
    city: "Chiang Mai",
    organizerName: "BTC Readers",
    registrationUrl: "https://example.com/register",
    participantCount: 15,
    isMonthly: true,
    isMarketActive: false,
    marketInfo: "",
  },
];

export const digitalContent: DigitalContent[] = [
  {
    id: "1",
    title: "Understanding Lightning Network",
    contentType: "Video",
    creatorName: "Adi Pratama",
    category: "Education",
    previewUrl: "",
    externalUrl: "https://youtube.com",
  },
  {
    id: "2",
    title: "The Bitcoin Standard (Notes)",
    contentType: "E-book",
    creatorName: "Rina Sari",
    category: "Books",
    previewUrl: "",
    externalUrl: "https://example.com",
  },
  {
    id: "3",
    title: "Running a Bitcoin Node in 2026",
    contentType: "Slide",
    creatorName: "Budi Crypto",
    category: "Technical",
    previewUrl: "",
    externalUrl: "https://slides.com",
  },
  {
    id: "4",
    title: "Why Bitcoin Matters for Thailand",
    contentType: "Article",
    creatorName: "Somchai BTC",
    category: "Opinion",
    previewUrl: "",
    externalUrl: "https://medium.com",
  },
  {
    id: "5",
    title: "Bitcoin Mining Explained Simply",
    contentType: "Video",
    creatorName: "Dian BTC",
    category: "Education",
    previewUrl: "",
    externalUrl: "https://youtube.com",
  },
  {
    id: "6",
    title: "Self Custody Best Practices",
    contentType: "Article",
    creatorName: "Satoshi TH",
    category: "Security",
    previewUrl: "",
    externalUrl: "https://example.com",
  },
];

export const pulseUpdates: PulseUpdate[] = [
  {
    id: "1",
    author: "Adi",
    message:
      "Just set up my first Lightning node! Anyone in Bangkok want to open a channel?",
    timeAgo: "2h ago",
  },
  {
    id: "2",
    author: "Rina",
    message:
      "Paid for my coffee with sats at Satoshi's Coffee today. The future is here.",
    timeAgo: "4h ago",
  },
  {
    id: "3",
    author: "Budi",
    message: "Bitcoin Conf Thailand tickets are selling fast. Who's going?",
    timeAgo: "6h ago",
  },
  {
    id: "4",
    author: "Somchai",
    message:
      "New article up: Why circular economies matter for Bitcoin adoption.",
    timeAgo: "8h ago",
  },
  {
    id: "5",
    author: "Dian",
    message:
      "The Lightning Market at this weekend's meetup was amazing. Stacked sats on merch!",
    timeAgo: "1d ago",
  },
];
