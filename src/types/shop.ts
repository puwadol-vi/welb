export interface OnlineProduct {
  id: string
  title: string
  category: string
  price: number
  currency: string
  sellerName: string
  contactUrl: string
  imageUrl: string
}

export type OnlineProductCategory =
  | "Accessories"
  | "Apparel"
  | "Stickers"
  | "Security"
  | "Books"
  | "Art"
