import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, XCircle } from 'lucide-react'

export default function CheckoutResult() {
  const { result } = useParams()
  const ok = result === 'success'
  return (
    <div className="mx-auto mt-24 max-w-md rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      {ok ? (
        <>
          <CheckCircle2 size={48} className="mx-auto text-emerald-500" />
          <h1 className="mt-4 text-2xl font-bold">Your ad is being published</h1>
          <p className="mt-2 text-slate-600">
            Payment received. Your listing will show as active within a few seconds.
          </p>
          <Link to="/my-listings" className="mt-6 inline-block rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700">
            View my listings
          </Link>
        </>
      ) : (
        <>
          <XCircle size={48} className="mx-auto text-slate-400" />
          <h1 className="mt-4 text-2xl font-bold">Checkout canceled</h1>
          <p className="mt-2 text-slate-600">No charge was made. Your draft is saved under My Listings — finish payment anytime.</p>
          <Link to="/my-listings" className="mt-6 inline-block rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700">
            Go to my listings
          </Link>
        </>
      )}
    </div>
  )
}
