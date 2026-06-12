import 'react';

// Let inline styles carry CSS custom properties (--foo) without TS errors. The
// marketing CSS uses --d, --pa etc. as data-driven knobs (difficulty colour,
// price accent) that get set inline per element.
declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
