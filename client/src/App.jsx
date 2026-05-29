import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { getMe } from './store/authSlice'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword  from './pages/auth/ResetPassword'
import Reviews        from './pages/Reviews'
import Payments from './pages/Payments'
import Login          from './pages/auth/Login'
import Register       from './pages/auth/Register'
import Dashboard      from './pages/Dashboard'
import Marketplace    from './pages/Marketplace'
import CreateGig      from './pages/client/CreateGig'
import GigDetail      from './pages/GigDetail'
import Chat           from './pages/Chat'
import AdminDashboard from './pages/admin/AdminDashboard'
import Analytics from './pages/freelancer/Analytics'
import Disputes from './pages/Disputes'
import ProgressTracker from './pages/ProgressTracker'
import AvailabilityCalendar from './pages/freelancer/AvailabilityCalendar'
import Profile from './pages/Profile'
import OAuthSuccess from './pages/auth/OAuthSuccess'
import TwoFactor from './pages/TwoFactor'
import AIMatch from './pages/AIMatch'
import VerifyEmail from './pages/auth/VerifyEmail'

const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth)
  return token ? children : <Navigate to="/login" />
}

const AdminRoute = ({ children }) => {
  const { token, user } = useSelector((state) => state.auth)
  if (!token) return <Navigate to="/login" />
  if (!user)  return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading... ⏳</p></div>
  if (user.role !== 'admin') return <Navigate to="/dashboard" />
  return children
}

function App() {
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)

  useEffect(() => {
    if (token) dispatch(getMe())
  }, [token, dispatch])

  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/marketplace" element={
        <ProtectedRoute><Marketplace /></ProtectedRoute>
      } />
      <Route path="/create-gig" element={
        <ProtectedRoute><CreateGig /></ProtectedRoute>
      } />
      <Route path="/gig/:id" element={
        <ProtectedRoute><GigDetail /></ProtectedRoute>
      } />
      <Route path="/chat/:userId" element={
        <ProtectedRoute><Chat /></ProtectedRoute>
      } />
      <Route path="/admin" element={
        <AdminRoute><AdminDashboard /></AdminRoute>
      } />
      <Route path="/forgot-password"        element={<ForgotPassword />} />
      <Route path="/reset-password/:token"  element={<ResetPassword />} />
      <Route path="/reviews/:userId" element={
      <ProtectedRoute><Reviews /></ProtectedRoute>
      } />
      <Route path="/payments" element={
      <ProtectedRoute><Payments /></ProtectedRoute>
      } />
      <Route path="/analytics" element={
  <ProtectedRoute><Analytics /></ProtectedRoute>
} />
      <Route path="/disputes" element={
  <ProtectedRoute><Disputes /></ProtectedRoute>
} />
<Route path="/progress/:gigId" element={
  <ProtectedRoute><ProgressTracker /></ProtectedRoute>
} />
<Route path="/availability" element={
  <ProtectedRoute><AvailabilityCalendar /></ProtectedRoute>
} />
<Route path="/profile" element={
  <ProtectedRoute><Profile /></ProtectedRoute>
} />
<Route path="/2fa" element={
  <ProtectedRoute><TwoFactor /></ProtectedRoute>
} />
<Route path="/ai-match" element={
  <ProtectedRoute><AIMatch /></ProtectedRoute>
} />
<Route path="/verify-email/:token" element={<VerifyEmail />} />
<Route path="/oauth-success" element={<OAuthSuccess />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
    
  )
}

export default App