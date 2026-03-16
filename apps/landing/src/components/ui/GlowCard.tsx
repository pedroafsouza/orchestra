export default function GlowCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-navy-800/60 p-6 backdrop-blur-sm transition hover:border-accent/30 hover:shadow-[0_0_30px_-5px_rgba(249,115,22,0.15)] ${className}`}
    >
      {children}
    </div>
  );
}
