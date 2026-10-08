export type LeadStage =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'VISIT_SCHEDULED'
  | 'VISIT_COMPLETED'
  | 'FOLLOW_UP'
  | 'NEGOTIATION'
  | 'CONVERTED'
  | 'LOST'

export interface AdminDashboard {
  totalUsers: number
  totalProperties: number
  publishedProperties: number
  totalEnquiries: number
  totalLeads: number
  assignedLeads: number
  unassignedLeads: number
  totalSiteVisits: number
  completedSiteVisits: number
  convertedLeads: number
  lostLeads: number
  leadsByStage: Record<LeadStage, number>
}