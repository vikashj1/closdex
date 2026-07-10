import Link from 'next/link';

export function MarketingFooter() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link className="wordmark" href="/">
              Clos<span className="mk">dex</span>
            </Link>
            <p className="footer__blurb">
              India&apos;s first sales talent leaderboard. Practice AI leads, climb the ranks, get
              hired on merit.
            </p>
          </div>
          <div className="footer__col">
            <h5>Salespersons</h5>
            <ul>
              <li>
                <Link href="/challenges">Challenges</Link>
              </li>
              <li>
                <Link href="/leaderboard">Leaderboard</Link>
              </li>
              <li>
                <Link href="/learn">Learn</Link>
              </li>
              <li>
                <Link href="/signup">Sign up free</Link>
              </li>
              <li>
                <Link href="/learn">How scoring works</Link>
              </li>
            </ul>
          </div>
          <div className="footer__col">
            <h5>Companies</h5>
            <ul>
              <li>
                <Link href="/coming-soon">Hiring side — coming soon</Link>
              </li>
            </ul>
          </div>
          <div className="footer__col">
            <h5>Company</h5>
            <ul>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/careers">Careers</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy</Link>
              </li>
              <li>
                <Link href="/terms">Terms</Link>
              </li>
              <li>
                <Link href="/security">
                  Security <span className="footer__soc">SOC2</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© 2026 Closdex</span>
          <span className="sep">·</span>
          <span>Made in Bangalore</span>
          <span className="right">v0.1 · IT Sales vertical</span>
        </div>
      </div>
    </footer>
  );
}
