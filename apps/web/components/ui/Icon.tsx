/** Inline SVG icon set — kept inline (no icon library) per the design's choice.
 *  16×16 viewBox unless otherwise noted; strokes inherit `currentColor`. */

export const Icon = {
  home: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z" />
    </svg>
  ),
  trophy: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 4h12v3a6 6 0 0 1-12 0z" />
      <path d="M6 4H4a2 2 0 0 0 2 4M18 4h2a2 2 0 0 1-2 4M12 13v4M8 21h8M9 17h6" />
    </svg>
  ),
  target: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),
  bolt: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
    </svg>
  ),
  fire: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3c2 4 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-5 1 1 2 1 2-1 0-1 0-2 1-3z" />
    </svg>
  ),
  book: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z" />
      <path d="M20 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z" />
    </svg>
  ),
  briefcase: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  user: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  ),
  bell: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 9a6 6 0 0 1 12 0v5l2 3H4l2-3zM9 19a3 3 0 0 0 6 0" />
    </svg>
  ),
  search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" />
    </svg>
  ),
  filter: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 5h18l-7 9v6l-4-2v-4z" />
    </svg>
  ),
  send: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 21l18-9L3 3l4 9z" />
      <path d="M7 12h14" />
    </svg>
  ),
  clock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="m4 12 6 6L20 6" />
    </svg>
  ),
  arrow: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  ),
  chevDown: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  trend: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 17l6-6 4 4 8-9" />
      <path d="M14 6h7v7" />
    </svg>
  ),
  google: () => (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M12 11v3.8h5.4c-.2 1.4-1.6 4-5.4 4-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 4.4 14.5 3.5 12 3.5 7.3 3.5 3.5 7.3 3.5 12s3.8 8.5 8.5 8.5c4.9 0 8.2-3.5 8.2-8.3 0-.6-.1-1-.1-1.5z"
      />
    </svg>
  ),
  linkedin: () => (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path
        fill="#0A66C2"
        d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8 18H5V10h3zM6.5 8.7a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4zM19 18h-3v-4.4c0-1.1-.4-1.8-1.4-1.8a1.5 1.5 0 0 0-1.4 1 1.8 1.8 0 0 0-.1.7V18h-3V10h3v1.3c.4-.6 1.2-1.5 2.8-1.5 2 0 3.5 1.3 3.5 4.2z"
      />
    </svg>
  ),
  settings: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
};
