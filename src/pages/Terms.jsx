const EFFECTIVE_DATE = 'July 5, 2026'

function Section({ n, title, children }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-slate-900">{n}. {title}</h2>
      <div className="mt-2 space-y-3 text-slate-700">{children}</div>
    </section>
  )
}

export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl py-12">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Terms of Use</h1>
      <p className="mt-2 text-sm text-slate-500">Effective {EFFECTIVE_DATE}</p>

      <p className="mt-6 text-slate-700">
        Welcome to Web Works ("we," "us," the "Service"), a classified-advertising service at
        web-wrx.net for web development projects and talent. By creating an account or posting
        a listing, you agree to these Terms. If you don't agree, please don't use the Service.
      </p>

      <Section n={1} title="What Web Works is (and isn't)">
        <p>
          Web Works is an advertising board. We publish listings and let users share contact
          information with each other. We are <strong>not</strong> a party to any agreement
          between users, and we do not process payments between users, supervise work, verify
          the accuracy of listings, guarantee outcomes, or mediate disputes. Any engagement you
          enter into with another user is solely between you and that user.
        </p>
      </Section>

      <Section n={2} title="Accounts">
        <p>
          Accounts are free and require accurate information. You must be at least 18 years old
          and able to form a binding contract. You are responsible for activity under your
          account and for keeping your credentials secure. One person or business per account.
        </p>
      </Section>

      <Section n={3} title="Listings and fees">
        <p>
          Publishing a listing costs $5.00 per month per listing (promotional pricing may apply),
          billed through Stripe as a recurring subscription until you cancel. Cancelling stops
          future renewals; your listing stays active until the end of the period you've paid for.
          Listing fees are non-refundable except where required by law.
        </p>
        <p>
          Listings must concern web development work — building, designing, maintaining, or
          consulting on websites and web applications. We may remove listings that are off-topic,
          unlawful, misleading, or that otherwise violate these Terms; fees for removed listings
          that violated these Terms are not refunded.
        </p>
      </Section>

      <Section n={4} title="Acceptable use">
        <p>You agree not to post or do any of the following:</p>
        <p>
          Misrepresent your identity, skills, portfolio, or project; post the same ad repeatedly;
          scrape or harvest user data; spam users whose contact info you've revealed; post content
          that is unlawful, infringing, defamatory, or malicious (including malware or phishing);
          circumvent the fee by soliciting in reviews, profiles, or other free-text fields; or use
          the Service to advertise unrelated goods or services.
        </p>
      </Section>

      <Section n={5} title="Reviews">
        <p>
          Reviews must reflect a genuine working relationship that began through the Service.
          Verification badges reflect our automated and manual checks but are not a guarantee of
          any user's quality or honesty. We may remove reviews we believe are fake, coerced, or
          retaliatory.
        </p>
      </Section>

      <Section n={6} title="Your content">
        <p>
          You keep ownership of what you post. You grant us a non-exclusive, worldwide,
          royalty-free license to host, display, and distribute your content as needed to operate
          and promote the Service. You represent that you have the rights to everything you post.
        </p>
      </Section>

      <Section n={7} title="Disclaimers">
        <p>
          The Service is provided "as is" and "as available," without warranties of any kind,
          express or implied. We do not vet users and make no representations about the quality,
          safety, legality, or reliability of any user, listing, or work product. Deal with others
          as you would with any stranger from a classified ad: use your own judgment, contracts,
          and payment protections.
        </p>
      </Section>

      <Section n={8} title="Limitation of liability">
        <p>
          To the maximum extent permitted by law, we are not liable for any indirect, incidental,
          special, consequential, or punitive damages, or for lost profits, arising from your use
          of the Service or dealings with other users. Our total liability for any claim will not
          exceed the amounts you paid us in the twelve months before the claim arose.
        </p>
      </Section>

      <Section n={9} title="Termination">
        <p>
          You may close your account at any time. We may suspend or terminate accounts that
          violate these Terms or create risk for other users, with or without notice. Sections 6
          through 10 survive termination.
        </p>
      </Section>

      <Section n={10} title="Governing law and changes">
        <p>
          These Terms are governed by the laws of the State of Nevada, without regard to conflict
          of law rules. We may update these Terms; material changes will be announced on the site
          or by email, and continued use after changes take effect constitutes acceptance. If any
          provision is found unenforceable, the rest remain in effect.
        </p>
        <p>
          Questions about these Terms:{' '}
          <a href="mailto:support@web-wrx.net" className="text-brand-600 underline">support@web-wrx.net</a>.
        </p>
      </Section>
    </div>
  )
}
