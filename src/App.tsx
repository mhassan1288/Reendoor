import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { RequireAuth, useAuth } from './auth'
import { AppProvider } from './context'
import { ActivityLogs, AdminDashboard, Blogs, Categories, Reports, Subscriptions } from './screens/Admin'
import { CalendarScreen } from './screens/Calendar'
import { CreateRequest } from './screens/CreateRequest'
import { Dashboard } from './screens/Dashboard'
import { CreateInvoice, Invoices, ViewInvoice } from './screens/Invoices'
import { Accounts, Contacts, Contractors, Inventory, SubContractors, Tenants } from './screens/People'
import { AddProperty, Properties, ViewProperty } from './screens/Properties'
import { Feedback, Profile } from './screens/Profile'
import { Queues } from './screens/Queues'
import { CreateQuote, Quotations, ViewQuote } from './screens/Quotes'
import { SignIn } from './screens/SignIn'
import { Splash } from './screens/Splash'
import { ViewRequest } from './screens/ViewRequest'

function AuthedLayout() {
  return (
    <RequireAuth>
      <Outlet />
    </RequireAuth>
  )
}

function RoleDashboard() {
  const { user } = useAuth()
  return user?.role === 'admin' ? <AdminDashboard /> : <Dashboard />
}

export default function App() {
  return (
    <div className="app-root">
      <div className="phone">
        <AppProvider>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/signin" element={<SignIn />} />
            <Route element={<AuthedLayout />}>
              <Route path="/queues" element={<Queues />} />
              <Route path="/requests/new" element={<CreateRequest />} />
              <Route path="/requests/:id" element={<ViewRequest />} />
              <Route path="/calendar" element={<CalendarScreen />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/new" element={<AddProperty />} />
              <Route path="/properties/:id" element={<ViewProperty />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/dashboard" element={<RoleDashboard />} />
              <Route path="/contractors" element={<Contractors />} />
              <Route path="/tenants" element={<Tenants />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/quotations" element={<Quotations />} />
              <Route path="/quotations/new" element={<CreateQuote />} />
              <Route path="/quotations/:id" element={<ViewQuote />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/new" element={<CreateInvoice />} />
              <Route path="/invoices/:id" element={<ViewInvoice />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/subcontractors" element={<SubContractors />} />
              <Route path="/activity" element={<ActivityLogs />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/blogs" element={<Blogs />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
      </div>
    </div>
  )
}
