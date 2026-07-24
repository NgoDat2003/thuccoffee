interface IconProps {
  className?: string;
}

export function HamburgerIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function CloseIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function PhoneIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.57 1 1 0 01-.25 1.01l-2.2 2.21z" />
    </svg>
  );
}

export function SearchIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx={11} cy={11} r={7} />
      <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
    </svg>
  );
}

export function FacebookIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0022 12z" />
    </svg>
  );
}

export function InstagramIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x={2} y={2} width={20} height={20} rx={5} />
      <circle cx={12} cy={12} r={4} />
      <circle cx={17.5} cy={6.5} r={0.5} fill="currentColor" />
    </svg>
  );
}

export function YoutubeIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 8.5a4 4 0 00-2.8-2.8C17.4 5.2 12 5.2 12 5.2s-5.4 0-7.2.5A4 4 0 002 8.5 41.6 41.6 0 001.5 12 41.6 41.6 0 002 15.5a4 4 0 002.8 2.8c1.8.5 7.2.5 7.2.5s5.4 0 7.2-.5a4 4 0 002.8-2.8 41.6 41.6 0 00.5-3.5 41.6 41.6 0 00-.5-3.5zM10 15V9l5.2 3z" />
    </svg>
  );
}
