
import { useCallback, useEffect, useState } from 'react'
import { getApiErrorMessage } from '../../api/apiError'
import type { LeadStage } from '../lead/lead.types'
import {
  getSiteVisits,
  rescheduleSiteVisit,
  scheduleSiteVisit,
  updateSiteVisitStatus,
} from './siteVisit.service'
import type {
  SiteVisit,
  SiteVisitStatus,
} from './siteVisit.types'

interface Props {
  leadId: number
  leadStage: LeadStage
  onChanged: () => Promise<void>
}

type VisitOutcome = Exclude<SiteVisitStatus, 'SCHEDULED'>

const outcomes: VisitOutcome[] = [
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function isFutureDate(value: string) {
  return Boolean(value) && new Date(value).getTime() > Date.now()
}

function SiteVisitsSection({ leadId, leadStage, onChanged }: Props) {
  const [visits, setVisits] = useState<SiteVisit[]>([])
  const [scheduledAt, setScheduledAt] = useState('')
  const [editDates, setEditDates] = useState<Record<number, string>>({})
  const [outcomeValues, setOutcomeValues] = useState<
    Record<number, VisitOutcome>
  >({})
  const [feedbackValues, setFeedbackValues] = useState<
    Record<number, string>
  >({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadVisits = useCallback(async () => {
    const response = await getSiteVisits(leadId)
    setVisits(response)
  }, [leadId])

  useEffect(() => {
    let cancelled = false

    getSiteVisits(leadId)
      .then((response) => {
        if (!cancelled) setVisits(response)
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(
            getApiErrorMessage(
              requestError,
              'Unable to load site visits.',
            ),
          )
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [leadId])

  const performAction = async (
    action: () => Promise<unknown>,
    successMessage: string,
  ) => {
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      await action()
      await Promise.all([loadVisits(), onChanged()])
      setSuccess(successMessage)
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          'Unable to update the site visit.',
        ),
      )
    } finally {
      setIsSaving(false)
    }
  }

  const activeVisit = visits.some(
    (visit) => visit.status === 'SCHEDULED',
  )

  const canSchedule =
    (leadStage === 'QUALIFIED' || leadStage === 'FOLLOW_UP') &&
    !activeVisit

  return (
    <section className="crm-detail-panel">
      <h2>Site Visits</h2>
      <p className="crm-panel-description">
        Schedule visits, update appointments, and record outcomes.
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

      {canSchedule && (
        <form
          className="crm-action-form"
          onSubmit={(event) => {
            event.preventDefault()

            if (!isFutureDate(scheduledAt)) {
              setError('Choose a future date and time.')
              return
            }

            void performAction(
              () => scheduleSiteVisit(leadId, scheduledAt),
              'Site visit scheduled successfully.',
            ).then(() => setScheduledAt(''))
          }}
        >
          <label htmlFor="new-site-visit-date">
            Schedule New Site Visit
          </label>
          <input
            id="new-site-visit-date"
            type="datetime-local"
            required
            value={scheduledAt}
            disabled={isSaving}
            onChange={(event) => setScheduledAt(event.target.value)}
          />
          <button
            className="button button-primary"
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Schedule Visit'}
          </button>
        </form>
      )}

      {!canSchedule && !isLoading && (
        <p className="crm-panel-description">
          A new visit can be scheduled when the lead is Qualified
          or in Follow Up and has no active scheduled visit.
        </p>
      )}

      <div className="crm-visit-list">
        {isLoading ? (
          <p>Loading visits...</p>
        ) : visits.length === 0 ? (
          <p className="crm-panel-description">
            No site visits recorded for this lead.
          </p>
        ) : (
          visits.map((visit) => (
            <article className="crm-visit-card" key={visit.id}>
              <div className="crm-visit-heading">
                <div>
                  <strong>Visit #{visit.id}</strong>
                  <p>{formatDate(visit.scheduledAt)}</p>
                </div>
                <span className="crm-stage-badge">
                  {formatLabel(visit.status)}
                </span>
              </div>

              <p className="crm-panel-description">
                Scheduled by {visit.scheduledByName}
              </p>

              {visit.feedback && (
                <p>
                  <strong>Feedback:</strong> {visit.feedback}
                </p>
              )}

              {visit.completedAt && (
                <p className="crm-panel-description">
                  Completed: {formatDate(visit.completedAt)}
                </p>
              )}

              {visit.status === 'SCHEDULED' && (
                <div className="crm-visit-controls">
                  <form
                    className="crm-action-form"
                    onSubmit={(event) => {
                      event.preventDefault()
                      const nextDate = editDates[visit.id] ?? ''

                      if (!isFutureDate(nextDate)) {
                        setError('Choose a future date and time.')
                        return
                      }

                      void performAction(
                        () => rescheduleSiteVisit(visit.id, nextDate),
                        'Visit rescheduled successfully.',
                      )
                    }}
                  >
                    <label htmlFor={`visit-date-${visit.id}`}>
                      Reschedule
                    </label>
                    <input
                      id={`visit-date-${visit.id}`}
                      type="datetime-local"
                      required
                      disabled={isSaving}
                      value={editDates[visit.id] ?? ''}
                      onChange={(event) =>
                        setEditDates((current) => ({
                          ...current,
                          [visit.id]: event.target.value,
                        }))
                      }
                    />
                    <button
                      className="button button-secondary"
                      type="submit"
                      disabled={isSaving}
                    >
                      Reschedule
                    </button>
                  </form>

                  <form
                    className="crm-action-form"
                    onSubmit={(event) => {
                      event.preventDefault()

                      void performAction(
                        () =>
                          updateSiteVisitStatus(
                            visit.id,
                            outcomeValues[visit.id] ?? 'COMPLETED',
                            feedbackValues[visit.id] ?? '',
                          ),
                        'Visit outcome saved successfully.',
                      )
                    }}
                  >
                    <label htmlFor={`visit-status-${visit.id}`}>
                      Record Outcome
                    </label>
                    <select
                      id={`visit-status-${visit.id}`}
                      disabled={isSaving}
                      value={outcomeValues[visit.id] ?? 'COMPLETED'}
                      onChange={(event) =>
                        setOutcomeValues((current) => ({
                          ...current,
                          [visit.id]: event.target.value as VisitOutcome,
                        }))
                      }
                    >
                      {outcomes.map((outcome) => (
                        <option key={outcome} value={outcome}>
                          {formatLabel(outcome)}
                        </option>
                      ))}
                    </select>

                    <label htmlFor={`visit-feedback-${visit.id}`}>
                      Feedback (Optional)
                    </label>
                    <textarea
                      id={`visit-feedback-${visit.id}`}
                      rows={3}
                      maxLength={2000}
                      disabled={isSaving}
                      value={feedbackValues[visit.id] ?? ''}
                      onChange={(event) =>
                        setFeedbackValues((current) => ({
                          ...current,
                          [visit.id]: event.target.value,
                        }))
                      }
                    />

                    <button
                      className="button button-primary"
                      type="submit"
                      disabled={isSaving}
                    >
                      Save Outcome
                    </button>
                  </form>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  )
}

export default SiteVisitsSection
