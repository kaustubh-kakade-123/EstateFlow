
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiErrorMessage } from '../api/apiError'
import { getLeads } from '../features/lead/lead.service'
import type {
  Lead,
  LeadPage,
  LeadPriority,
  LeadStage,
} from '../features/lead/lead.types'
import { useAuth } from '../features/auth/useAuth'

const stageOptions: LeadStage[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'VISIT_SCHEDULED',
  'VISIT_COMPLETED',
  'FOLLOW_UP',
  'NEGOTIATION',
  'CONVERTED',
  'LOST',
]

const priorityOptions: LeadPriority[] = ['LOW', 'MEDIUM', 'HIGH']

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function LeadsPage() {
  const { hasRole } = useAuth()
  const [leadPage, setLeadPage] = useState<LeadPage | null>(null)
  const [stage, setStage] = useState<LeadStage | ''>('')
  const [priority, setPriority] = useState<LeadPriority | ''>('')
  const [agentIdInput, setAgentIdInput] = useState('')
  const [assignedAgentId, setAssignedAgentId] = useState<
    number | undefined
  >(undefined)
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const isAdmin = hasRole('ADMIN')

  useEffect(() => {
    let cancelled = false

    const loadLeads = async () => {
      setIsLoading(true)
      setError('')

      try {
        const response = await getLeads({
          stage: stage || undefined,
          priority: priority || undefined,
          assignedAgentId: isAdmin ? assignedAgentId : undefined,
          page,
          size: 10,
        })

        if (!cancelled) {
          setLeadPage(response)
        }
      } catch (requestError) {
        if (!cancelled) {
          setLeadPage(null)
          setError(
            getApiErrorMessage(
              requestError,
              'Unable to load leads.',
            ),
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadLeads()

    return () => {
      cancelled = true
    }
  }, [stage, priority, assignedAgentId, page, isAdmin])

  const handleAgentFilter = () => {
    const trimmed = agentIdInput.trim()

    if (!trimmed) {
      setAssignedAgentId(undefined)
      setPage(0)
      return
    }

    const parsed = Number(trimmed)

    if (!Number.isSafeInteger(parsed) || parsed <= 0) {
      setError('Enter a valid positive Agent User ID.')
      return
    }

    setError('')
    setAssignedAgentId(parsed)
    setPage(0)
  }

  const leads: Lead[] = leadPage?.content ?? []

  return (
    <div className="container page-section">
      <div className="page-header">
        <div>
          <h1>Lead CRM</h1>
          <p>
            {isAdmin
              ? 'Monitor enquiries, manage the pipeline, and assign agents.'
              : 'Manage your assigned leads and track buyer progress.'}
          </p>
        </div>

        <span className="crm-total-badge">
          {leadPage?.totalElements ?? 0} Leads
        </span>
      </div>

      <section className="crm-filter-panel" aria-label="Lead filters">
        <div className="crm-filter-field">
          <label htmlFor="lead-stage-filter">Stage</label>
          <select
            id="lead-stage-filter"
            value={stage}
            onChange={(event) => {
              setStage(event.target.value as LeadStage | '')
              setPage(0)
            }}
          >
            <option value="">All Stages</option>
            {stageOptions.map((option) => (
              <option key={option} value={option}>
                {formatLabel(option)}
              </option>
            ))}
          </select>
        </div>

        <div className="crm-filter-field">
          <label htmlFor="lead-priority-filter">Priority</label>
          <select
            id="lead-priority-filter"
            value={priority}
            onChange={(event) => {
              setPriority(event.target.value as LeadPriority | '')
              setPage(0)
            }}
          >
            <option value="">All Priorities</option>
            {priorityOptions.map((option) => (
              <option key={option} value={option}>
                {formatLabel(option)}
              </option>
            ))}
          </select>
        </div>

        {isAdmin && (
          <div className="crm-filter-field">
            <label htmlFor="lead-agent-filter">Assigned Agent ID</label>
            <div className="crm-inline-filter">
              <input
                id="lead-agent-filter"
                type="number"
                min="1"
                placeholder="All agents"
                value={agentIdInput}
                onChange={(event) =>
                  setAgentIdInput(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleAgentFilter()
                  }
                }}
              />
              <button
                className="button button-secondary"
                type="button"
                onClick={handleAgentFilter}
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </section>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {isLoading ? (
        <p>Loading leads...</p>
      ) : leads.length === 0 ? (
        <div className="empty-state">
          <h2>No leads found</h2>
          <p>
            {isAdmin
              ? 'New buyer enquiries will appear here as leads.'
              : 'No leads are currently assigned to you with these filters.'}
          </p>
        </div>
      ) : (
        <>
          <div className="crm-lead-list">
            {leads.map((lead) => (
              <article className="crm-lead-card" key={lead.id}>
                <div className="crm-lead-heading">
                  <div>
                    <span className="crm-lead-id">
                      Lead #{lead.id}
                    </span>
                    <h2>{lead.propertyTitle}</h2>
                    <p>
                      Buyer: {lead.buyerName} · {lead.buyerEmail}
                    </p>
                  </div>

                  <span className="crm-stage-badge">
                    {formatLabel(lead.stage)}
                  </span>
                </div>

                <div className="crm-lead-meta">
                  <span>
                    <strong>Priority:</strong>{' '}
                    {formatLabel(lead.priority)}
                  </span>
                  <span>
                    <strong>Agent:</strong>{' '}
                    {lead.assignedAgentName ??
                      (lead.assignedAgentId
                        ? `User #${lead.assignedAgentId}`
                        : 'Unassigned')}
                  </span>
                  <span>
                    <strong>Enquiry:</strong> #{lead.enquiryId}
                  </span>
                  <span>
                    <strong>Created:</strong>{' '}
                    {new Date(lead.createdAt).toLocaleDateString(
                      'en-IN',
                    )}
                  </span>
                </div>

                {lead.enquiryMessage && (
                  <p className="crm-lead-message">
                    {lead.enquiryMessage}
                  </p>
                )}

                <div className="crm-lead-actions">
                  <Link
                    className="button button-primary"
                    to={`/leads/${lead.id}`}
                  >
                    View &amp; Manage Lead
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="crm-pagination">
            <button
              className="button button-secondary"
              type="button"
              disabled={page === 0 || isLoading}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </button>

            <span>
              Page {(leadPage?.page ?? page) + 1} of{' '}
              {leadPage?.totalPages ?? 1}
            </span>

            <button
              className="button button-secondary"
              type="button"
              disabled={leadPage?.last ?? true}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default LeadsPage
