
export type SiteVisitStatus =
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

export interface SiteVisit {
  id: number
  leadId: number
  scheduledByUserId: number
  scheduledByName: string
  scheduledAt: string
  status: SiteVisitStatus
  feedback: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}
