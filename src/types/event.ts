export interface Event {
  id: string
  title: string
  description: string
  isPaid: boolean
  price: number
  currency: string
  startDate: string
  location: string
  city: string
  organizerName: string
  registrationUrl: string
  participantCount: number
  isMonthly: boolean
  isMarketActive: boolean
  marketInfo: string
}
