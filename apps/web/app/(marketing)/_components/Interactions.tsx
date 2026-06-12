'use client';

import { useEffect } from 'react';

// Ports the interactions.js shipped with the marketing HTML bundle.
// Runs once on mount, scoped to .cmkt — selectors only match marketing markup.
export function Interactions() {
  useEffect(() => {
    const reduce =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = document.querySelector<HTMLElement>('.cmkt') ?? document;

    // activity heatmap
    const heat = root.querySelector<HTMLElement>('.heat');
    if (heat) {
      const pattern = [
        0, 1, 0, 2, 1, 3, 2, 1, 0, 1, 2, 4, 3, 2, 1, 0, 1, 2, 3, 2, 4, 3, 2, 1, 0, 1, 2, 1, 0, 2,
        1, 3, 4, 3, 2, 1, 0, 1, 2, 3, 2, 1, 1, 2, 3, 4, 4, 3, 2, 1, 2, 1, 0, 1, 2, 3,
      ];
      for (let i = 0; i < 56; i++) {
        const c = document.createElement('i');
        const lvl = pattern[i % pattern.length];
        if (lvl) c.className = 'l' + lvl;
        heat.appendChild(c);
      }
    }

    // scroll reveal
    const staggers = Array.from(root.querySelectorAll<HTMLElement>('[data-stagger]'));
    const showAll = () => staggers.forEach((s) => s.classList.add('in'));

    let io: IntersectionObserver | null = null;
    if (reduce || !('IntersectionObserver' in window)) {
      showAll();
    } else {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('in');
              io?.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
      );
      staggers.forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.9) s.classList.add('in');
        else io!.observe(s);
      });
    }
    const failsafe = window.setTimeout(showAll, 1400);

    // 3-audience toggle
    const tabs = Array.from(root.querySelectorAll<HTMLElement>(".seg [role='tab']"));
    const panels = Array.from(root.querySelectorAll<HTMLElement>('.panel'));
    const tabHandlers: Array<{ el: HTMLElement; fn: () => void }> = [];
    tabs.forEach((tab) => {
      const fn = () => {
        const key = tab.getAttribute('data-tab');
        tabs.forEach((t) => t.setAttribute('aria-selected', t === tab ? 'true' : 'false'));
        panels.forEach((p) =>
          p.setAttribute('data-active', p.getAttribute('data-panel') === key ? 'true' : 'false'),
        );
      };
      tab.addEventListener('click', fn);
      tabHandlers.push({ el: tab, fn });
    });

    // FAQ accordion
    const items = Array.from(root.querySelectorAll<HTMLElement>('.acc__item'));
    const accHandlers: Array<{ el: HTMLElement; fn: () => void }> = [];
    const setOpen = (item: HTMLElement, open: boolean) => {
      const a = item.querySelector<HTMLElement>('.acc__a');
      if (!a) return;
      item.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        a.style.height = a.scrollHeight + 'px';
      } else {
        a.style.height = a.scrollHeight + 'px';
        requestAnimationFrame(() => {
          a.style.height = '0px';
        });
      }
    };
    items.forEach((item) => {
      const q = item.querySelector<HTMLElement>('.acc__q');
      const a = item.querySelector<HTMLElement>('.acc__a');
      if (!q || !a) return;
      a.style.height = item.getAttribute('aria-expanded') === 'true' ? a.scrollHeight + 'px' : '0px';
      const fn = () => {
        const isOpen = item.getAttribute('aria-expanded') === 'true';
        setOpen(item, !isOpen);
      };
      q.addEventListener('click', fn);
      accHandlers.push({ el: q, fn });
    });

    let rt: number | undefined;
    const onResize = () => {
      window.clearTimeout(rt);
      rt = window.setTimeout(() => {
        items.forEach((item) => {
          if (item.getAttribute('aria-expanded') === 'true') {
            const a = item.querySelector<HTMLElement>('.acc__a');
            if (!a) return;
            a.style.height = 'auto';
            a.style.height = a.scrollHeight + 'px';
          }
        });
      }, 150);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.clearTimeout(failsafe);
      io?.disconnect();
      tabHandlers.forEach(({ el, fn }) => el.removeEventListener('click', fn));
      accHandlers.forEach(({ el, fn }) => el.removeEventListener('click', fn));
      window.removeEventListener('resize', onResize);
      window.clearTimeout(rt);
    };
  }, []);

  return null;
}
