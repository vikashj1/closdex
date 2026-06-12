import type { ReactNode } from 'react';
import { Inter, Space_Grotesk, Space_Mono } from 'next/font/google';
import { MarketingNav } from './_components/MarketingNav';
import { MarketingFooter } from './_components/MarketingFooter';
import { Interactions } from './_components/Interactions';
import './marketing.css';

// Marketing pages run their own type stack scoped under `.cmkt` so they don't
// collide with the logged-in app's DM Sans / JetBrains Mono.
const inter = Inter({ subsets: ['latin'], variable: '--cmkt-font-body', display: 'swap' });
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--cmkt-font-display',
  display: 'swap',
});
const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--cmkt-font-mono',
  display: 'swap',
});

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`cmkt ${inter.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}
      style={
        {
          '--body': `var(--cmkt-font-body), Inter, system-ui, sans-serif`,
          '--display': `var(--cmkt-font-display), "Space Grotesk", system-ui, sans-serif`,
          '--mono': `var(--cmkt-font-mono), "Space Mono", ui-monospace, monospace`,
        } as React.CSSProperties
      }
    >
      <MarketingNav />
      {children}
      <MarketingFooter />
      <Interactions />
    </div>
  );
}
