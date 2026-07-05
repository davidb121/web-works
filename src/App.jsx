import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import PostAd from './pages/PostAd'
import ListingDetail from './pages/ListingDetail'
import MyListings from './pages/MyListings'
import Profile from './pages/Profile'
import CheckoutResult from './pages/CheckoutResult'

function Protected({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <PageSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (!profile) return <Navigate to="/onboarding" replace />
  return children
}

export function PageSpinner() {
  return (
    <div className="flex justify-center py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/post" element={<Protected><PostAd /></Protected>} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/my-listings" element={<Protected><MyListings /></Protected>} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/checkout/:result" element={<Protected><CheckoutResult /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
        Web Works — cheap &amp; easy classifieds for web development work. No commissions, ever.
      </footer>
    </div>
  )
}
