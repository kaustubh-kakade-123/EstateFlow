
import httpClient from '../../api/httpClient'
import type { FollowUp, FollowUpStatus } from './followUp.types'

export async function getFollowUps(
  leadId: number,
): Promise<FollowUp[]> {
  const response = await httpClient.get<FollowUp[]>(
    `/api/v1/leads/${leadId}/follow-ups`,
  )

  return response.data
}

export async function createFollowUp(
  leadId: number,
  scheduledAt: string,
  note: string,
): Promise<FollowUp> {
  const response = await httpClient.post<FollowUp>(
    `/api/v1/leads/${leadId}/follow-ups`,
    {
      scheduledAt,
      note: note.trim() || null,
    },
  )

  return response.data
}

export async function updateFollowUpStatus(
  followUpId: number,
  status: Exclude<FollowUpStatus, 'PENDING'>,
): Promise<FollowUp> {
  const response = await httpClient.patch<FollowUp>(
    `/api/v1/follow-ups/${followUpId}/status`,
    { status },
  )

  return response.data
}
