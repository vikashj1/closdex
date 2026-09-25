import type { Metadata } from 'next';
import './hire.css';

// Shashank's freelance offer page. Deliberately outside the (marketing) route
// group: that layout wraps pages in the Closdex product nav and footer, and
// this page sells Shashank personally, not Closdex. Self-contained styles.

const CRM_URL = 'https://crm.codevisionaryservices.com';
const CONTACT_EMAIL = 'cvs.devs01@gmail.com';

// A bare mailto: opens an empty draft, and "write to a stranger from scratch" is
// where most of this page's intent dies. Prefilling a subject and three prompts
// turns it into filling a form. Encoded so the line breaks survive the client.
const MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  'Project enquiry — from closdex.com/hire',
)}&body=${encodeURIComponent(
  [
    "Here's what's eating my team's time:",
    '',
    '',
    'Tools we already use:',
    '',
    '',
    'Rough timeline or budget (if you have one):',
    '',
    '',
  ].join('\n'),
)}`;

const PAGE_URL = 'https://closdex.com/hire';
const PAGE_TITLE = 'Shashank — AI Automation & Integration Consultant';
const PAGE_DESC =
  'I architect and ship AI workflows into real businesses — the systems that do the outreach, the ops, the content, the CRM. Not throwaway prototypes.';

// Open Graph tags are required, not cosmetic: LinkedIn refuses to create a
// Featured-section card (and renders a bare link when shared) without them.
export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESC,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESC,
    url: PAGE_URL,
    siteName: 'Shashank — Applied AI Consulting',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESC,
  },
};

const offers = [
  {
    name: 'AI CRM Setup',
    price: '$2,500 – $6,000',
    timeline: '1–2 weeks',
    pitch: 'Your own CRM, self-hosted, AI outreach built in.',
    detail:
      'I deploy VS-CRM on your infrastructure, import your leads, and set up templates plus bulk email and WhatsApp. Mobile-ready, branded to you. No per-seat SaaS bill, and your data stays yours.',
    scope:
      '$2,500 is a standard deploy: your branding, your leads imported, email and WhatsApp templates live. It moves toward $6,000 with custom fields and pipelines, migration from an existing CRM, or integrations into tools you already run.',
    featured: true,
  },
  {
    name: 'Outreach Automation Sprint',
    price: '$1,500 – $4,000',
    timeline: '1–2 weeks',
    pitch: 'A lead machine that runs itself.',
    detail:
      'Scraping, enrichment, and personalized LinkedIn/WhatsApp outreach wired into your CRM — built on infrastructure that survives the platform changing its interface, with a health check so it fails loudly instead of silently.',
    scope:
      '$1,500 covers one channel and one lead source, wired into your CRM. It moves toward $4,000 with multiple channels, enrichment from several sources, or per-lead messaging personalized by AI.',
    featured: false,
  },
  {
    name: 'Custom AI Agent for Your Ops',
    price: '$3,000 – $8,000',
    timeline: '2–4 weeks',
    pitch: 'A tireless teammate for one painful job.',
    detail:
      'A scoped agent that handles one repetitive job end to end — inbox triage, report generation, data crawling, or a content-to-video pipeline. Built, deployed, and documented so it keeps running without me.',
    scope:
      '$3,000 is one job, one clear input and output, running on your infrastructure. It moves toward $8,000 when the agent spans several systems, needs a human approval step, or has to hold up under real volume.',
    featured: false,
  },
];

const proof = [
  {
    name: 'VS-CRM',
    body: 'Self-hosted, multi-tenant CRM running in production: lead pipelines, bulk email and WhatsApp campaigns, reusable templates, mobile-ready. Designed and shipped solo, from data model to deploy.',
    link: { href: CRM_URL, label: 'See it running' },
  },
  {
    name: 'Closdex',
    body: 'A full platform, not a feature: salespeople practice against AI-simulated leads and get scored on a transparent rubric, companies browse rank-vetted talent and hire. Next.js and NestJS across eight services, Postgres and Redis, payments and AI scoring wired in.',
    link: { href: 'https://closdex.com', label: 'Visit Closdex' },
  },
  {
    name: 'Outreach engine',
    body: 'LinkedIn and WhatsApp lead generation on persistent sessions, video posting included — still working after the platforms redesigned their interfaces underneath it. Most scrapers die at exactly that point.',
    link: null,
  },
  {
    name: 'Ghostly',
    body: 'A consumer app on the Play Store, built solo end to end: live Postgres backend and a daily content pipeline that still runs. Shipped, not prototyped.',
    link: {
      href: 'https://play.google.com/store/apps/details?id=com.shashank.ghostly',
      label: 'View on Play Store',
    },
  },
];

export default function HirePage() {
  return (
    <main className="hire">
      <section className="hire__hero">
        <div className="hire__container hire__hero-grid">
          <div className="hire__hero-copy">
            {/* Mobile only. The big cutout is hidden below 860px, which would leave a
                first-person pitch with no face on the traffic that matters most — so
                the same asset comes back as an avatar on the tag row. Decorative:
                the name and claim are already in the copy. */}
            <div className="hire__idrow">
              <span className="hire__avatar" aria-hidden="true">
                <img
                  src="/hire/shashank-portrait.webp"
                  width={368}
                  height={500}
                  alt=""
                  loading="eager"
                  decoding="async"
                />
              </span>
              <span className="hire__tag">AI Automation &amp; Integration Consultant</span>
            </div>
            <h1 className="hire__title">
              I architect and ship AI workflows into real businesses — the systems that do the
              outreach, the ops, the content, the CRM. <em>Not throwaway prototypes.</em>
            </h1>
            <p className="hire__lead">
              Most AI work stops at a demo. I build the version that runs on Monday morning, handles
              real data, and keeps running when a platform changes underneath it.
            </p>
            <div className="hire__cta-row">
              <a className="hire__btn hire__btn--primary" href={MAILTO}>
                Book a 20-min call <span aria-hidden="true">→</span>
              </a>
              <a
                className="hire__btn hire__btn--ghost"
                href={CRM_URL}
                target="_blank"
                rel="noreferrer"
              >
                See a live demo
              </a>
            </div>
            <p className="hire__note">
              On the call I&rsquo;ll show you the CRM running live, not a slide deck.
            </p>
          </div>

          {/* The page pitches Shashank in the first person, so the hero needs a face
              to attach the claim to. Cut out and faded at the base so it reads as
              part of the hero gradient rather than a pasted rectangle. Above the
              fold, so it loads eagerly — but the headline is the LCP element, so
              this deliberately does not claim high fetch priority. */}
          <div className="hire__portrait" aria-hidden="true">
            <picture>
              {/* Matches the 860px CSS breakpoint below, where the portrait is
                  hidden — an empty srcSet there stops mobile downloading an
                  image it will never paint. */}
              <source
                media="(max-width: 860px)"
                srcSet="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
              />
              <source
                type="image/webp"
                srcSet="/hire/shashank-portrait.webp 368w, /hire/shashank-portrait@2x.webp 735w"
                sizes="340px"
              />
              {/* PNG is a legacy fallback only — WebP above serves every current
                  browser, including retina. Kept at 1x so the fallback stays
                  under the asset budget. */}
              <img
                src="/hire/shashank-portrait.png"
                sizes="340px"
                width={735}
                height={1000}
                alt=""
                loading="eager"
                decoding="async"
              />
            </picture>
          </div>
        </div>
      </section>

      <section className="hire__container hire__section">
        <h2 className="hire__h2">What I take on</h2>
        <div className="hire__offers">
          {offers.map((offer) => (
            <article
              key={offer.name}
              className={`hire__offer${offer.featured ? ' hire__offer--featured' : ''}`}
            >
              {offer.featured ? <span className="hire__badge">Start here</span> : null}
              <h3 className="hire__offer-name">{offer.name}</h3>
              <p className="hire__offer-pitch">{offer.pitch}</p>
              <p className="hire__offer-detail">{offer.detail}</p>
              <div className="hire__offer-meta">
                <span className="hire__price">{offer.price}</span>
                <span className="hire__timeline">{offer.timeline}</span>
              </div>
              {/* A bare range makes buyers price themselves at the top end and
                  hesitate. Saying what sits at each end turns the number into a
                  scope conversation instead of a risk. */}
              <p className="hire__offer-scope">{offer.scope}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="hire__container hire__section">
        <h2 className="hire__h2">Already shipped</h2>
        <div className="hire__proof">
          {proof.map((item) => (
            <article key={item.name} className="hire__proof-item">
              <h3 className="hire__proof-name">{item.name}</h3>
              <p className="hire__proof-body">{item.body}</p>
              {item.link ? (
                <a
                  className="hire__proof-link"
                  href={item.link.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.link.label} <span aria-hidden="true">→</span>
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="hire__container hire__section hire__close">
        <h2 className="hire__h2">If any of this is a problem you have</h2>
        <p className="hire__lead">
          Tell me what&rsquo;s eating your team&rsquo;s time. I&rsquo;ll tell you straight whether
          it&rsquo;s a good fit before you pay for anything.
        </p>
        <a className="hire__btn hire__btn--primary" href={MAILTO}>
          Start a conversation <span aria-hidden="true">→</span>
        </a>
      </section>
    </main>
  );
}
