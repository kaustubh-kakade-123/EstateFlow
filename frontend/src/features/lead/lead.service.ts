
import httpClient from '../../api/httpClient'
import type {
  Lead,
  LeadActivity,
  LeadFilters,
  LeadPage,
  LeadStage,
} from './lead.types'

export async function getLeads(
  filters: LeadFilters = {},
): Promise<LeadPage> {
  const response = await httpClient.get<LeadPage>(
    '/api/v1/leads',
    { params: filters },
  )

  return response.data
}

export async function getLead(leadId: number): Promise<Lead> {
  const response = await httpClient.get<Lead>(
    `/api/v1/leads/${leadId}`,
  )

  return response.data
}

export async function assignLead(
  leadId: number,
  agentUserId: number,
): Promise<Lead> {
  const response = await httpClient.patch<Lead>(
    `/api/v1/leads/${leadId}/assign`,
    { agentUserId },
  )

  return response.data
}

export async function updateLeadStage(
  leadId: number,
  stage: LeadStage,
  lostReason?: string,
): Promise<Lead> {
  const response = await httpClient.patch<Lead>(
    `/api/v1/leads/${leadId}/stage`,
    { stage, lostReason: lostReason || null },
  )

  return response.data
}

export async function getLeadActivities(
  leadId: number,
): Promise<LeadActivity[]> {
  const response = await httpClient.get<LeadActivity[]>(
    `/api/v1/leads/${leadId}/activities`,
  )

  return response.data
}
