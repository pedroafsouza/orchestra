import SectionWrapper from './ui/SectionWrapper';
import GlowCard from './ui/GlowCard';

const features = [
  {
    title: 'Visual Flow Editor',
    description:
      'Design multi-screen flows with a drag-and-drop canvas. Connect screens, define navigation, and preview instantly.',
  },
  {
    title: 'Server-Driven UI',
    description:
      'Ship UI changes without app updates. Your backend controls what the native app renders — in real time.',
  },
  {
    title: 'Capability-Based Delivery',
    description:
      'Tailor experiences per device. Orchestra adapts components based on OS version, screen size, and available features.',
  },
  {
    title: 'AI-Powered',
    description:
      'Go from a text prompt to a working app. Orchestra uses AI to generate screens, connect data, and suggest UX improvements.',
  },
];

export default function Features() {
  return (
    <SectionWrapper>
      <h2 className="text-center text-3xl font-bold text-white md:text-4xl">
        Everything you need to ship
      </h2>
      <div className="mt-16 grid gap-6 md:grid-cols-2">
        {features.map((f) => (
          <GlowCard key={f.title}>
            <h3 className="text-lg font-semibold text-white">{f.title}</h3>
            <p className="mt-2 text-white/50">{f.description}</p>
          </GlowCard>
        ))}
      </div>
    </SectionWrapper>
  );
}
