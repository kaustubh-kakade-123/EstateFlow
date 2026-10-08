
import type { PageResponse } from '../property/property.types'

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

export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Lead {
  id: number
  enquiryId: number
  propertyId: number
  propertyTitle: string
  buyerUserId: number
  buyerName: string
  buyerEmail: string
  enquiryMessage: string | null
  enquirySource: string
  assignedAgentId: number | null
  assignedAgentName: string | null
  stage: LeadStage
  priority: LeadPriority
  lostReason: string | null
  convertedAt: string | null
  version: number
  createdAt: string
  updatedAt: string
}

export interface LeadActivity {
  id: number
  leadId: number
  performedByUserId: number
  performedByName: string
  activityType: string
  description: string
  oldStage: LeadStage | null
  newStage: LeadStage | null
  createdAt: string
}

export interface LeadFilters {
  stage?: LeadStage
  priority?: LeadPriority
  assignedAgentId?: number
  page?: number
  size?: number
}

export type LeadPage = PageResponse<Lead>
