import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import DashboardPage from './pages/DashboardPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import MyEnquiriesPage from './pages/MyEnquiriesPage'
import MyShortlistPage from './pages/MyShortlistPage'
import NotFoundPage from './pages/NotFoundPage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './routes/ProtectedRoute'
import MyPropertiesPage from './pages/MyPropertiesPage'
import PropertyFormPage from './pages/PropertyFormPage'
import AdminPropertiesPage from './pages/AdminPropertiesPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import LeadsPage from './pages/LeadsPage'
import LeadDetailPage from './pages/LeadDetailPage'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />

        <Route
          path="properties/:propertyId"
          element={<PropertyDetailPage />}
        />

        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="shortlist" element={<MyShortlistPage />} />
          <Route path="enquiries" element={<MyEnquiriesPage />} />
          <Route path="my-properties" element={<MyPropertiesPage />} />
          <Route path="my-properties/new" element={<PropertyFormPage />} />
          <Route path="leads" element={<LeadsPage />} />
<Route
  path="my-properties/:propertyId/edit"
  element={<PropertyFormPage />}
/>
<Route
  path="admin/properties"
  element={<AdminPropertiesPage />}
/>
<Route
  path="admin/dashboard"
  element={<AdminDashboardPage />}
/>
          <Route path="leads/:leadId" element={<LeadDetailPage />} />
        </Route>

        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  )
}

export default App