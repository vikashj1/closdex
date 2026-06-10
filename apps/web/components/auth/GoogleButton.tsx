'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (res: { credential: string }) => void;
            ux_mode?: 'popup' | 'redirect';
            auto_select?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill';
              logo_alignment?: 'left' | 'center';
              width?: number;
            },
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface Props {
  onIdToken: (idToken: string) => void | Promise<void>;
  label?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  disabled?: boolean;
}

const GIS_SCRIPT = 'https://accounts.google.com/gsi/client';

/** Google "Continue with Google" button.
 *  - Reads NEXT_PUBLIC_GOOGLE_CLIENT_ID — if missing, the button hides
 *    silently so unconfigured environments don't show a broken control.
 *  - Lazy-loads Google Identity Services (GIS) script once.
 *  - Renders the official Google button via GIS so it stays compliant
 *    with brand guidelines and accessible by default. */
export function GoogleButton({ onIdToken, label = 'continue_with', disabled }: Props) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;
    if (window.google?.accounts?.id) {
      setReady(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener('load', () => setReady(true));
      return;
    }
    const s = document.createElement('script');
    s.src = GIS_SCRIPT;
    s.async = true;
    s.defer = true;
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, [clientId]);

  useEffect(() => {
    if (!ready || !clientId || !buttonRef.current) return;
    window.google!.accounts.id.initialize({
      client_id: clientId,
      callback: async (res) => {
        if (res.credential) await onIdToken(res.credential);
      },
      ux_mode: 'popup',
    });
    window.google!.accounts.id.renderButton(buttonRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: label,
      shape: 'rectangular',
      logo_alignment: 'left',
      width: 320,
    });
  }, [ready, clientId, label, onIdToken]);

  if (!clientId) return null;

  return (
    <div
      ref={buttonRef}
      style={{
        display: 'flex',
        justifyContent: 'center',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    />
  );
}
