import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PlusCircle, LogOut, LayoutList, UserCircle, Star, ShieldAlert } from 'lucide-react'
import Avatar from './Avatar'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 font-extrabold text-white">W</span>
          <span className="text-lg font-bold tracking-tight">Web Works</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/post"
            className="flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            <PlusCircle size={16} /> Post an ad
          </Link>
          {user ? (
            <>
              <Link to="/my-listings" title="My listings" className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:flex">
                <LayoutList size={16} /> My listings
              </Link>
              <Link to="/reviews" title="Reviews" className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:flex">
                <Star size={16} /> Reviews
              </Link>
              {profile?.is_admin && (
                <Link to="/admin" title="Moderation" className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
                  <ShieldAlert size={16} />
                </Link>
              )}
              <Link to={profile ? `/profile/${user.id}` : '/onboarding'} title="Profile">
                <Avatar profile={profile} size={34} />
              </Link>
              <button
                onClick={async () => { await signOut(); navigate('/') }}
                title="Sign out"
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <Link to="/login" className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              <UserCircle size={18} /> Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
