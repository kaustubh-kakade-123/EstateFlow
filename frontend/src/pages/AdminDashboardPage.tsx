
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiErrorMessage } from '../api/apiError'
import { getAdminDashboard } from '../features/admin/adminDashboard.service'
import type {
  AdminDashboard,
  LeadStage,
} from '../features/admin/adminDashboard.types'

const pipelineStages: { key: LeadStage; label: string }[] = [
  { key: 'NEW', label: 'New' },
  { key: 'CONTACTED', label: 'Contacted' },
  { key: 'QUALIFIED', label: 'Qualified' },
  { key: 'VISIT_SCHEDULED', label: 'Visit Scheduled' },
  { key: 'VISIT_COMPLETED', label: 'Visit Completed' },
  { key: 'FOLLOW_UP', label: 'Follow Up' },
  { key: 'NEGOTIATION', label: 'Negotiation' },
  { key: 'CONVERTED', label: 'Converted' },
  { key: 'LOST', label: 'Lost' },
]

function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadDashboard = async () => {
      try {
        const response = await getAdminDashboard()

        if (!cancelled) {
          setDashboard(response)
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            getApiErrorMessage(
              requestError,
              'Unable to load dashboard metrics.',
            ),
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      cancelled = true
    }
  }, [])

  if (isLoading) {
    return (
      <div className="container page-section">
        <p>Loading dashboard metrics...</p>
      </div>
    )
  }

  if (error || !dashboard) {
    return (
      <div className="container page-section">
        <h1>Admin Dashboard</h1>
        <div className="alert alert-error" role="alert">
          {error || 'Dashboard data is unavailable.'}
        </div>
      </div>
    )
  }

  const metrics = [
    { label: 'Total Users', value: dashboard.totalUsers },
    { label: 'Total Properties', value: dashboard.totalProperties },
    { label: 'Published Properties', value: dashboard.publishedProperties },
    { label: 'Total Enquiries', value: dashboard.totalEnquiries },
    { label: 'Total Leads', value: dashboard.totalLeads },
    { label: 'Assigned Leads', value: dashboard.assignedLeads },
    { label: 'Unassigned Leads', value: dashboard.unassignedLeads },
    { label: 'Site Visits', value: dashboard.totalSiteVisits },
    { label: 'Completed Visits', value: dashboard.completedSiteVisits },
    { label: 'Converted Leads', value: dashboard.convertedLeads },
    { label: 'Lost Leads', value: dashboard.lostLeads },
  ]

  const maxStageCount = Math.max(
    1,
    ...pipelineStages.map(
      (stage) => dashboard.leadsByStage?.[stage.key] ?? 0,
    ),
  )

  return (
    <div className="container page-section">
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>EstateFlow marketplace and CRM performance overview.</p>
        </div>

        <Link className="button button-primary" to="/admin/properties">
          Review Properties
        </Link>
      </div>

      <div className="admin-metrics-grid">
        {metrics.map((metric) => (
          <article className="admin-metric-card" key={metric.label}>
            <span className="admin-metric-label">{metric.label}</span>
            <strong className="admin-metric-value">
              {metric.value.toLocaleString('en-IN')}
            </strong>
          </article>
        ))}
      </div>

      <section className="admin-pipeline-section">
        <div className="admin-section-heading">
          <div>
            <h2>Lead Pipeline</h2>
            <p>Current leads grouped by CRM stage.</p>
          </div>

          <span className="admin-pipeline-total">
            {dashboard.totalLeads} Total Leads
          </span>
        </div>

        <div className="admin-pipeline-list">
          {pipelineStages.map((stage) => {
            const count = dashboard.leadsByStage?.[stage.key] ?? 0
            const percentage = (count / maxStageCount) * 100

            return (
              <div className="admin-pipeline-row" key={stage.key}>
                <span className="admin-pipeline-label">
                  {stage.label}
                </span>

                <div
                  className="admin-pipeline-track"
                  role="progressbar"
                  aria-label={`${stage.label} leads`}
                  aria-valuenow={count}
                  aria-valuemin={0}
                  aria-valuemax={maxStageCount}
                >
                  <div
                    className="admin-pipeline-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <strong className="admin-pipeline-count">
                  {count}
                </strong>
              </div>
            )
          })}
        </div>
      </section>

      <section className="admin-dashboard-actions">
        <h2>Quick Actions</h2>
        <p>Manage property verification and publication.</p>

        <Link className="button button-secondary" to="/admin/properties">
          Open Property Moderation
        </Link>
      </section>
    </div>
  )
}

export default AdminDashboardPage
