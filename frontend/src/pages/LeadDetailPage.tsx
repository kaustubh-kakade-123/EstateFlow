
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../api/apiError'
import { useAuth } from '../features/auth/useAuth'
import {
  assignLead,
  getLead,
  getLeadActivities,
  updateLeadStage,
} from '../features/lead/lead.service'
import type {
  Lead,
  LeadActivity,
  LeadStage,
} from '../features/lead/lead.types'
import SiteVisitsSection from '../features/visit/SiteVisitsSection'
import FollowUpsSection from '../features/followup/FollowUpsSection'

const allowedTransitions: Record<LeadStage, LeadStage[]> = {
  NEW: ['CONTACTED', 'LOST'],
  CONTACTED: ['QUALIFIED', 'FOLLOW_UP', 'LOST'],
  QUALIFIED: ['FOLLOW_UP', 'LOST'],
  VISIT_SCHEDULED: ['FOLLOW_UP', 'LOST'],
  VISIT_COMPLETED: ['FOLLOW_UP', 'NEGOTIATION', 'LOST'],
  FOLLOW_UP: ['CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'LOST'],
  NEGOTIATION: ['CONVERTED', 'FOLLOW_UP', 'LOST'],
  CONVERTED: [],
  LOST: [],
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function LeadDetailPage() {
  const { leadId } = useParams<{ leadId: string }>()
  const { hasRole } = useAuth()

  const [lead, setLead] = useState<Lead | null>(null)
  const [activities, setActivities] = useState<LeadActivity[]>([])
  const [agentId, setAgentId] = useState('')
  const [nextStage, setNextStage] = useState<LeadStage | ''>('')
  const [lostReason, setLostReason] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isAdmin = hasRole('ADMIN')
  const parsedLeadId = Number(leadId)
  const validLeadId =
    Number.isSafeInteger(parsedLeadId) && parsedLeadId > 0

  const loadDetails = useCallback(async () => {
    if (!validLeadId) {
  return
}

    try {
      const [leadResponse, activityResponse] = await Promise.all([
        getLead(parsedLeadId),
        getLeadActivities(parsedLeadId),
      ])

      setLead(leadResponse)
      setActivities(activityResponse)
      setAgentId(
        leadResponse.assignedAgentId?.toString() ?? '',
      )
      setNextStage('')
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          'Unable to load lead details.',
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }, [parsedLeadId, validLeadId])

  useEffect(() => {
  let cancelled = false

  const fetchInitialDetails = async () => {
    if (!validLeadId) {
      if (!cancelled) {
        setError('Invalid lead ID.')
        setIsLoading(false)
      }
      return
    }

    try {
      const [leadResponse, activityResponse] = await Promise.all([
        getLead(parsedLeadId),
        getLeadActivities(parsedLeadId),
      ])

      if (cancelled) return

      setLead(leadResponse)
      setActivities(activityResponse)
      setAgentId(leadResponse.assignedAgentId?.toString() ?? '')
      setNextStage('')
    } catch (requestError) {
      if (!cancelled) {
        setError(
          getApiErrorMessage(
            requestError,
            'Unable to load lead details.',
          ),
        )
      }
    } finally {
      if (!cancelled) {
        setIsLoading(false)
      }
    }
  }

  void fetchInitialDetails()

  return () => {
    cancelled = true
  }
}, [parsedLeadId, validLeadId])

  const handleAssign = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!lead || !isAdmin) return

    const parsedAgentId = Number(agentId)

    if (!Number.isSafeInteger(parsedAgentId) || parsedAgentId <= 0) {
      setError('Enter a valid positive Agent User ID.')
      return
    }

    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      await assignLead(lead.id, parsedAgentId)
      await loadDetails()
      setSuccess('Lead assigned successfully.')
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, 'Unable to assign lead.'),
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleStageChange = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!lead || !nextStage) return

    if (nextStage === 'LOST' && !lostReason.trim()) {
      setError('A reason is required when marking a lead as Lost.')
      return
    }

    if (lostReason.length > 255) {
      setError('Lost reason must not exceed 255 characters.')
      return
    }

    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      await updateLeadStage(
        lead.id,
        nextStage,
        nextStage === 'LOST' ? lostReason.trim() : undefined,
      )

      await loadDetails()
      setLostReason('')
      setSuccess('Lead stage updated successfully.')
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          'Unable to update lead stage.',
        ),
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container page-section">
        <p>Loading lead details...</p>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="container page-section">
        <Link to="/leads">← Back to Lead CRM</Link>
        <div className="alert alert-error" role="alert">
          {error || 'Lead not found.'}
        </div>
      </div>
    )
  }

  const availableStages = allowedTransitions[lead.stage]

  return (
    <div className="container page-section">
      <Link className="crm-back-link" to="/leads">
        ← Back to Lead CRM
      </Link>

      <div className="page-header">
        <div>
          <h1>Lead #{lead.id}</h1>
          <p>{lead.propertyTitle}</p>
        </div>

        <span className="crm-stage-badge">
          {formatLabel(lead.stage)}
        </span>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="status">
          {success}
        </div>
      )}

      <section className="crm-detail-panel">
        <h2>Lead Information</h2>

        <div className="crm-detail-grid">
          <div>
            <span className="crm-detail-label">Buyer</span>
            <strong>{lead.buyerName}</strong>
          </div>

          <div>
            <span className="crm-detail-label">Buyer Email</span>
            <strong>{lead.buyerEmail}</strong>
          </div>

          <div>
            <span className="crm-detail-label">Property ID</span>
            <strong>#{lead.propertyId}</strong>
          </div>

          <div>
            <span className="crm-detail-label">Enquiry ID</span>
            <strong>#{lead.enquiryId}</strong>
          </div>

          <div>
            <span className="crm-detail-label">Priority</span>
            <strong>{formatLabel(lead.priority)}</strong>
          </div>

          <div>
            <span className="crm-detail-label">Assigned Agent</span>
            <strong>
              {lead.assignedAgentName ??
                (lead.assignedAgentId
                  ? `User #${lead.assignedAgentId}`
                  : 'Unassigned')}
            </strong>
          </div>

          <div>
            <span className="crm-detail-label">Created</span>
            <strong>{formatDate(lead.createdAt)}</strong>
          </div>

          <div>
            <span className="crm-detail-label">Last Updated</span>
            <strong>{formatDate(lead.updatedAt)}</strong>
          </div>
        </div>

        {lead.enquiryMessage && (
          <div className="crm-detail-message">
            <span className="crm-detail-label">Buyer Message</span>
            <p>{lead.enquiryMessage}</p>
          </div>
        )}

        {lead.lostReason && (
          <div className="crm-detail-message">
            <span className="crm-detail-label">Lost Reason</span>
            <p>{lead.lostReason}</p>
          </div>
        )}
      </section>

      <div className="crm-detail-actions-grid">
        {isAdmin && (
          <section className="crm-detail-panel">
            <h2>Assign Agent</h2>
            <p className="crm-panel-description">
              Enter the numeric User ID of an existing AGENT account.
            </p>

            <form className="crm-action-form" onSubmit={handleAssign}>
              <label htmlFor="assign-agent-id">
                Agent User ID
              </label>

              <input
                id="assign-agent-id"
                type="number"
                min="1"
                required
                value={agentId}
                onChange={(event) =>
                  setAgentId(event.target.value)
                }
                placeholder="e.g. 5"
                disabled={isSaving}
              />

              <button
                className="button button-primary"
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Assign Lead'}
              </button>
            </form>
          </section>
        )}

        <section className="crm-detail-panel">
          <h2>Update Lead Stage</h2>

          {availableStages.length === 0 ? (
            <p className="crm-panel-description">
              This lead is in a final stage. No further stage
              transitions are available.
            </p>
          ) : (
            <form
              className="crm-action-form"
              onSubmit={handleStageChange}
            >
              <label htmlFor="lead-next-stage">
                Next Stage
              </label>

              <select
                id="lead-next-stage"
                required
                value={nextStage}
                disabled={isSaving}
                onChange={(event) =>
                  setNextStage(
                    event.target.value as LeadStage | '',
                  )
                }
              >
                <option value="">Select next stage</option>
                {availableStages.map((stage) => (
                  <option key={stage} value={stage}>
                    {formatLabel(stage)}
                  </option>
                ))}
              </select>

              {nextStage === 'LOST' && (
                <>
                  <label htmlFor="lead-lost-reason">
                    Lost Reason
                  </label>

                  <textarea
                    id="lead-lost-reason"
                    rows={3}
                    maxLength={255}
                    required
                    value={lostReason}
                    disabled={isSaving}
                    onChange={(event) =>
                      setLostReason(event.target.value)
                    }
                    placeholder="Why was this lead lost?"
                  />
                </>
              )}

              <button
                className="button button-primary"
                type="submit"
                disabled={isSaving || !nextStage}
              >
                {isSaving ? 'Saving...' : 'Update Stage'}
              </button>
            </form>
          )}

          <p className="crm-panel-description">
            Visit-related stages are updated through the Site Visit
            workflow.
          </p>
        </section>
      </div>

      <SiteVisitsSection
  leadId={lead.id}
  leadStage={lead.stage}
  onChanged={loadDetails}
/>

<FollowUpsSection
  leadId={lead.id}
  leadStage={lead.stage}
  onChanged={loadDetails}
/>

      <section className="crm-detail-panel">
        <h2>Activity History</h2>

        {activities.length === 0 ? (
          <p className="crm-panel-description">
            No activities recorded yet.
          </p>
        ) : (
          <div className="crm-activity-list">
            {activities.map((activity) => (
              <article
                className="crm-activity-item"
                key={activity.id}
              >
                <div className="crm-activity-heading">
                  <strong>
                    {formatLabel(activity.activityType)}
                  </strong>

                  <time dateTime={activity.createdAt}>
                    {formatDate(activity.createdAt)}
                  </time>
                </div>

                <p>{activity.description}</p>

                <span className="crm-activity-actor">
                  By {activity.performedByName}
                </span>

                {activity.oldStage && activity.newStage && (
                  <span className="crm-activity-transition">
                    {formatLabel(activity.oldStage)}
                    {' → '}
                    {formatLabel(activity.newStage)}
                  </span>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default LeadDetailPage
