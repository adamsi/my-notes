export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* spiral binding */}
      <path
        d="M22 7v7M32 7v7M42 7v7"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* notepad */}
      <rect x="13" y="12" width="30" height="42" rx="6" stroke="currentColor" strokeWidth="4" />
      {/* text lines */}
      <path
        d="M21 28h14M21 36h9"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* pen (with background halo to separate from the pad) */}
      <g transform="rotate(38 47 33)">
        <rect x="40.5" y="10.5" width="14" height="35" rx="7" fill="var(--background)" />
        <path d="M41.5 42h12L47.5 54z" fill="var(--background)" />
        <rect x="43" y="13" width="9" height="29" rx="4.5" fill="currentColor" />
        <path d="M43.5 40.5h8L47.5 51z" fill="currentColor" />
        <path d="M43 20.5h9" stroke="var(--background)" strokeWidth="2" />
      </g>
    </svg>
  );
}
