import { Link } from 'react-router-dom'
import { ConnectSpot } from '../components/illustrations'
import { Eye, ShieldCheck, MessagesSquare } from 'lucide-react'

export default function Connect() {
  return (
    <div className="mx-auto max-w-3xl py-12">
      <ConnectSpot className="h-24 w-24" />
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">How connecting works</h1>
      <p className="mt-3 text-lg text-slate-600">
        Web Wrx doesn't sit between you and the person you want to work with. Here's
        exactly what happens when a client and a freelancer find each other.
      </p>

      <div className="mt-10 space-y-8">
        <div className="flex gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Eye size={20} /></span>
          <div>
            <h2 className="font-bold">1. Reveal contact</h2>
            <p className="mt-1 text-slate-700">
              Every ad has a "Reveal contact" button. Sign in (accounts are free) and click it,
              and the poster's contact info — email, phone, whatever they chose to share —
              appears. That's the whole mechanism: no on-site inbox to babysit, no chat with a
              stranger through a platform middleman.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><MessagesSquare size={20} /></span>
          <div>
            <h2 className="font-bold">2. Talk however you like</h2>
            <p className="mt-1 text-slate-700">
              From there you communicate directly — email, phone, video call, your project
              tools. Negotiate scope, price, and timeline yourselves, use your own contract,
              and pay however you both prefer. Web Wrx never touches the money, which is
              why there are no commissions on anything you earn or spend.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><ShieldCheck size={20} /></span>
          <div>
            <h2 className="font-bold">3. A record that protects both sides</h2>
            <p className="mt-1 text-slate-700">
              When you reveal a contact, we log that the two of you connected (never the
              conversation itself — that happens off-site). That record is what will let you
              leave a verified review of each other once the work is done, so good freelancers
              and good clients build reputations that spammers can't fake. Reveals are also
              rate-limited to keep contact info from being harvested.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-bold">A few common-sense tips</h2>
        <p className="mt-2 text-slate-700">
          You're dealing directly with another person, like any classified ad. Agree on scope in
          writing before starting, prefer milestone payments over big upfront transfers, and check
          the other party's profile, links, and reviews. If something feels off, walk away and tell
          us at support@web-wrx.net.
        </p>
      </div>

      <div className="mt-10 flex gap-3">
        <Link to="/search" className="rounded-full bg-brand-600 px-6 py-3 font-semibold text-white shadow hover:bg-brand-700">
          Browse listings
        </Link>
        <Link to="/post" className="rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-100">
          Post an ad
        </Link>
      </div>
    </div>
  )
}
