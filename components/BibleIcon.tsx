/**
 * Bible icon (book with a cross) from Tabler Icons — https://tabler.io/icons
 * MIT License, Copyright (c) 2020-2026 Paweł Kuna.
 */
export default function BibleIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M19 4v16h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12" />
      <path d="M19 16h-12a2 2 0 0 0 -2 2" />
      <path d="M12 7v6" />
      <path d="M10 9h4" />
    </svg>
  );
}
