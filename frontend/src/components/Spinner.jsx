export default function Spinner({ className = 'h-5 w-5 border-2 border-white/30 border-t-white' }) {
  return <span className={`block animate-spin rounded-full border-solid ${className}`} aria-hidden="true" />;
}
