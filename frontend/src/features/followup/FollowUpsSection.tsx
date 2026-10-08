
import { useCallback, useEffect, useState } from 'react'
import { getApiErrorMessage } from '../../api/apiError'
import type { LeadStage } from '../lead/lead.types'
import {
  createFollowUp,
  getFollowUps,
  updateFollowUpStatus,
} from './followUp.service'
import type { FollowUp } from './followUp.types'

interface Props {
  leadId: number
  leadStage: LeadStage
  onChanged: () => Promise<void>
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function FollowUpsSection({ leadId, leadStage, onChanged }: Props) {
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [scheduledAt, setScheduledAt] = useState('')
  const [note, setNote] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadFollowUps = useCallback(async () => {
    const response = await getFollowUps(leadId)
    setFollowUps(response)
  }, [leadId])

  useEffect(() => {
    let cancelled = false

    getFollowUps(leadId)
      .then((response) => {
        if (!cancelled) {
          setFollowUps(response)
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(
            getApiErrorMessage(
              requestError,
              'Unable to load follow-ups.',
            ),
          )
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [leadId])

  const hasPendingFollowUp = followUps.some(
    (followUp) => followUp.status === 'PENDING',
  )

  const canCreate =
    leadStage !== 'CONVERTED' &&
    leadStage !== 'LOST' &&
    leadStage !== 'VISIT_SCHEDULED' &&
    !hasPendingFollowUp

  const handleCreate = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!scheduledAt || new Date(scheduledAt).getTime() <= Date.now()) {
      setError('Choose a future date and time.')
      return
    }

    if (note.length > 2000) {
      setError('Follow-up note cannot exceed 2000 characters.')
      return
    }

    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      await createFollowUp(leadId, scheduledAt, note)
      await Promise.all([loadFollowUps(), onChanged()])

      setScheduledAt('')
      setNote('')
      setSuccess('Follow-up scheduled successfully.')
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          'Unable to schedule follow-up.',
        ),
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = async (
    followUpId: number,
    status: 'COMPLETED' | 'CANCELLED',
  ) => {
    const confirmed = window.confirm(
      status === 'COMPLETED'
        ? 'Mark this follow-up as completed?'
        : 'Cancel this follow-up?',
    )

    if (!confirmed) return

    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      await updateFollowUpStatus(followUpId, status)
      await Promise.all([loadFollowUps(), onChanged()])

      setSuccess(
        status === 'COMPLETED'
          ? 'Follow-up marked as completed.'
          : 'Follow-up cancelled.',
      )
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          'Unable to update follow-up status.',
        ),
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="crm-detail-panel">
      <h2>Follow-ups</h2>

      <p className="crm-panel-description">
        Plan the next buyer contact and track pending tasks.
      </p>

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

      {isLoading ? (
        <p>Loading follow-ups...</p>
      ) : (
        <>
          {canCreate ? (
            <form
              className="crm-action-form crm-followup-form"
              onSubmit={(event) => void handleCreate(event)}
            >
              <label htmlFor="followup-date">
                Schedule Follow-up
              </label>

              <input
                id="followup-date"
                type="datetime-local"
                required
                value={scheduledAt}
                disabled={isSaving}
                onChange={(event) =>
                  setScheduledAt(event.target.value)
                }
              />

              <label htmlFor="followup-note">
                Note (Optional)
              </label>

              <textarea
                id="followup-note"
                rows={3}
                maxLength={2000}
                value={note}
                disabled={isSaving}
                onChange={(event) =>
                  setNote(event.target.value)
                }
                placeholder="e.g. Call buyer to discuss financing options"
              />

              <button
                className="button button-primary"
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? 'Scheduling...' : 'Schedule Follow-up'}
              </button>
            </form>
          ) : (
            <p className="crm-panel-description">
              {hasPendingFollowUp
                ? 'This lead already has a pending follow-up. Complete or cancel it before scheduling another.'
                : 'Follow-ups cannot be created while a site visit is scheduled or after a lead is converted or lost.'}
            </p>
          )}

          <div className="crm-followup-list">
            {followUps.length === 0 ? (
              <p className="crm-panel-description">
                No follow-ups recorded for this lead.
              </p>
            ) : (
              followUps.map((followUp) => (
                <article
                  className="crm-followup-card"
                  key={followUp.id}
                >
                  <div className="crm-followup-heading">
                    <div>
                      <strong>Follow-up #{followUp.id}</strong>
                      <p>{formatDate(followUp.scheduledAt)}</p>
                    </div>

                    <span className="crm-stage-badge">
                      {followUp.status}
                    </span>
                  </div>

                  <p className="crm-panel-description">
                    Assigned to: {followUp.assignedToName}
                  </p>

                  {followUp.note && (
                    <p className="crm-followup-note">
                      {followUp.note}
                    </p>
                  )}

                  {followUp.completedAt && (
                    <p className="crm-panel-description">
                      Completed: {formatDate(followUp.completedAt)}
                    </p>
                  )}

                  {followUp.status === 'PENDING' && (
                    <div className="crm-followup-actions">
                      <button
                        className="button button-primary"
                        type="button"
                        disabled={isSaving}
                        onClick={() =>
                          void handleStatusChange(
                            followUp.id,
                            'COMPLETED',
                          )
                        }
                      >
                        Mark Completed
                      </button>

                      <button
                        className="button button-secondary"
                        type="button"
                        disabled={isSaving}
                        onClick={() =>
                          void handleStatusChange(
                            followUp.id,
                            'CANCELLED',
                          )
                        }
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default FollowUpsSection
