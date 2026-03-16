import SectionWrapper from './ui/SectionWrapper';

const stats = [
  { value: '10x', label: 'Faster than traditional development' },
  { value: 'Zero', label: 'Native code to write' },
  { value: 'Minutes', label: 'From prompt to deployed app' },
];

export default function SocialProof() {
  return (
    <SectionWrapper>
      <div className="grid gap-8 md:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-white/10 bg-navy-800/40 p-8 text-center"
          >
            <p className="text-4xl font-extrabold text-accent">{s.value}</p>
            <p className="mt-2 text-white/50">{s.label}</p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
