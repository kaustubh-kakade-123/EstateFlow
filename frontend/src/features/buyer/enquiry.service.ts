import httpClient from '../../api/httpClient'
import type {
  CreateEnquiryRequest,
  Enquiry,
  EnquiryPage,
} from './enquiry.types'

export async function createEnquiry(
  propertyId: number,
  request: CreateEnquiryRequest,
): Promise<Enquiry> {
  const response = await httpClient.post<Enquiry>(
    `/api/v1/properties/${propertyId}/enquiries`,
    request,
  )

  return response.data
}

export async function getMyEnquiries(): Promise<EnquiryPage> {
  const response = await httpClient.get<EnquiryPage>(
    '/api/v1/enquiries/me',
  )

  return response.data
}