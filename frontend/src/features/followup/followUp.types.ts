
export type FollowUpStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED'

export interface FollowUp {
  id: number
  leadId: number
  assignedToUserId: number
  assignedToName: string
  scheduledAt: string
  status: FollowUpStatus
  note: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}
