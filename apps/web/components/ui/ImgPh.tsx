import { CSSProperties } from 'react';

interface Props {
  label?: string;
  height?: number;
  style?: CSSProperties;
}

/** Striped placeholder. Replace with real <Image> components as the build matures. */
export function ImgPh({ label = 'image', height = 160, style }: Props) {
  return (
    <div
      className="stripe-ph"
      style={{
        height,
        borderRadius: 10,
        border: '1px dashed var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-mute)',
        fontSize: 11.5,
        fontFamily: 'JetBrains Mono',
        ...style,
      }}
    >
      {label}
    </div>
  );
}
