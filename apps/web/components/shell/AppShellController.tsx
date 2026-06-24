'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Vanilla DOM controller for the mobile shell:
 *   - opens/closes drawer / sheet / search via data-*-toggle / data-*-close
 *   - Esc + scrim-tap closes
 *   - simple focus-trap in whichever overlay is open
 *   - left-swipe (>45px) closes the drawer
 *   - route change auto-closes everything
 *
 * Ported from the reference .dc.html files (2026-06-24). The controller
 * mutates classes on <html> (drawer-open, sheet-open, search-open) which
 * the CSS in `app/responsive.css` keys off.
 */
export function AppShellController() {
  const pathname = usePathname();

  // Route change: clean up any open overlay.
  useEffect(() => {
    const H = document.documentElement;
    H.classList.remove('drawer-open', 'sheet-open', 'search-open');
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).__closdexShell) return;
    (window as any).__closdexShell = true;

    const H = document.documentElement;
    let lastTrig: HTMLElement | null = null;

    function open(c: string) { H.classList.add(c); }
    function close(c: string) {
      H.classList.remove(c);
      if (lastTrig) {
        try { lastTrig.focus(); } catch (e) { /* swallow */ }
        lastTrig = null;
      }
    }

    function onClick(e: MouseEvent) {
      const target = e.target as Element;
      let t: Element | null;
      if ((t = target.closest('[data-drawer-toggle]'))) {
        lastTrig = t as HTMLElement;
        open('drawer-open');
        const s = document.querySelector('.app-sidebar a') as HTMLElement | null;
        if (s) setTimeout(() => s.focus(), 60);
        return;
      }
      if (target.closest('[data-drawer-close]')) { close('drawer-open'); return; }
      if (target.closest('.app-sidebar a')) { H.classList.remove('drawer-open'); return; }
      if ((t = target.closest('[data-search-toggle]'))) {
        lastTrig = t as HTMLElement;
        open('search-open');
        const i = document.querySelector('.search-overlay input') as HTMLElement | null;
        if (i) setTimeout(() => i.focus(), 70);
        return;
      }
      if (target.closest('[data-search-close]')) { close('search-open'); return; }
      if ((t = target.closest('[data-sheet-toggle]'))) {
        lastTrig = t as HTMLElement;
        open('sheet-open');
        return;
      }
      if (target.closest('[data-sheet-close]')) { close('sheet-open'); return; }
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        close('drawer-open');
        close('search-open');
        close('sheet-open');
        return;
      }
      if (e.key !== 'Tab') return;
      const box: HTMLElement | null = H.classList.contains('drawer-open')
        ? document.querySelector('.app-sidebar')
        : H.classList.contains('search-open')
        ? document.querySelector('.search-overlay')
        : H.classList.contains('sheet-open')
        ? document.querySelector('.r-sheet')
        : null;
      if (!box) return;
      const focusables = Array.from(
        box.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    let sx = 0;
    let sy = 0;
    function onTouchStart(e: TouchEvent) {
      const t = e.touches[0];
      sx = t.clientX;
      sy = t.clientY;
    }
    function onTouchEnd(e: TouchEvent) {
      if (!H.classList.contains('drawer-open')) return;
      const t = e.changedTouches[0];
      if (t.clientX - sx < -45 && Math.abs(t.clientY - sy) < 70) {
        H.classList.remove('drawer-open');
      }
    }

    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend', onTouchEnd);
      (window as any).__closdexShell = false;
    };
  }, []);

  return null;
}
