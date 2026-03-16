export default function GradientBlob({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-[120px] ${className}`}
      style={{
        background:
          'radial-gradient(circle, rgba(249,115,22,0.25) 0%, rgba(139,92,246,0.15) 50%, transparent 80%)',
      }}
    />
  );
}
