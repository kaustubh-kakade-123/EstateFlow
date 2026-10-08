export type EnquirySource =
  | 'PROPERTY_PAGE'
  | 'SEARCH'
  | 'OTHER'

export type EnquiryStatus =
  | 'NEW'
  | 'PROCESSED'
  | 'CLOSED'

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

export type LeadPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'

export interface CreateEnquiryRequest {
  message: string
  source: EnquirySource
}

export interface Enquiry {
  enquiryId: number
  propertyId: number
  buyerUserId: number
  message: string
  source: EnquirySource
  status: EnquiryStatus
  leadId: number
  leadStage: LeadStage
  leadPriority: LeadPriority
  createdAt: string
}

export interface EnquiryPage {
  content: Enquiry[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}