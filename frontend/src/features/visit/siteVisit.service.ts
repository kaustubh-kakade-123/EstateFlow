
import httpClient from '../../api/httpClient'
import type {
  SiteVisit,
  SiteVisitStatus,
} from './siteVisit.types'

export async function getSiteVisits(
  leadId: number,
): Promise<SiteVisit[]> {
  const response = await httpClient.get<SiteVisit[]>(
    `/api/v1/leads/${leadId}/site-visits`,
  )
  return response.data
}

export async function scheduleSiteVisit(
  leadId: number,
  scheduledAt: string,
): Promise<SiteVisit> {
  const response = await httpClient.post<SiteVisit>(
    `/api/v1/leads/${leadId}/site-visits`,
    { scheduledAt },
  )
  return response.data
}

export async function rescheduleSiteVisit(
  visitId: number,
  scheduledAt: string,
): Promise<SiteVisit> {
  const response = await httpClient.patch<SiteVisit>(
    `/api/v1/site-visits/${visitId}`,
    { scheduledAt },
  )
  return response.data
}

export async function updateSiteVisitStatus(
  visitId: number,
  status: Exclude<SiteVisitStatus, 'SCHEDULED'>,
  feedback: string,
): Promise<SiteVisit> {
  const response = await httpClient.patch<SiteVisit>(
    `/api/v1/site-visits/${visitId}/status`,
    { status, feedback: feedback.trim() || null },
  )
  return response.data
}
