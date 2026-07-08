import { useEffect } from 'react'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
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
import About from './pages/About'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Cookies from './pages/Cookies'
import Search from './pages/Search'
import Connect from './pages/Connect'
import Reviews from './pages/Reviews'
import Admin from './pages/Admin'
import Faq from './pages/Faq'

const ROUTE_META = {
  '/': ['Web Wrx — Classifieds for Web Development Work', 'The $5 classifieds for web dev freelancing. Free accounts, direct contact, no commissions.'],
  '/search': ['Search listings — Web Wrx', 'Browse every active web development project and talent ad. Filter by keyword or skill.'],
  '/connect': ['How connecting works — Web Wrx', 'Reveal contact info and work directly — no platform middleman, no commissions.'],
  '/about': ['About — Web Wrx', 'Why one developer built a $5 classifieds board for web development work.'],
  '/post': ['Post an ad — Web Wrx', 'Advertise your project or your skills. $5/month, cancel anytime.'],
  '/faq': ['Pricing & FAQ — Web Wrx', 'Every price, the refund policy, how review badges work, and who runs the site.'],
  '/terms': ['Terms of Use — Web Wrx', 'The rules of the road for Web Wrx classifieds.'],
  '/privacy': ['Privacy Policy — Web Wrx', 'What we collect, why, and what we never do with your data.'],
  '/cookies': ['Cookie Policy — Web Wrx', 'The short list of what Web Wrx stores in your browser.'],
}

function RouteMeta() {
  const { pathname } = useLocation()
  useEffect(() => {
    const meta =
      ROUTE_META[pathname] ??
      (pathname.startsWith('/listing/') ? ['Listing — Web Wrx', 'A web development classified ad on Web Wrx.']
      : pathname.startsWith('/profile/') ? ['Profile — Web Wrx', 'A freelancer or client profile on Web Wrx.']
      : ROUTE_META['/'])
    document.title = meta[0]
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta[1])
  }, [pathname])
  return null
}

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
      <RouteMeta />
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/post" element={<PostAd />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/my-listings" element={<Protected><MyListings /></Protected>} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/checkout/:result" element={<Protected><CheckoutResult /></Protected>} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/search" element={<Search />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/reviews" element={<Protected><Reviews /></Protected>} />
          <Route path="/admin" element={<Protected><Admin /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
        <p>Web Wrx — cheap &amp; easy classifieds for web development work. No commissions, ever.</p>
        <nav className="mt-3 flex justify-center gap-5">
          <Link to="/about" className="hover:text-slate-700 hover:underline">About us</Link>
          <Link to="/faq" className="hover:text-slate-700 hover:underline">Pricing &amp; FAQ</Link>
          <Link to="/terms" className="hover:text-slate-700 hover:underline">Terms of use</Link>
          <Link to="/privacy" className="hover:text-slate-700 hover:underline">Privacy</Link>
          <Link to="/cookies" className="hover:text-slate-700 hover:underline">Cookies</Link>
          <a href="mailto:support@web-wrx.net" className="hover:text-slate-700 hover:underline">Contact</a>
        </nav>
      </footer>
    </div>
  )
}
