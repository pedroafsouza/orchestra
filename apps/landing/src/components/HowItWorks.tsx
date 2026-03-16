import SectionWrapper from './ui/SectionWrapper';

const steps = [
  {
    number: '01',
    title: 'Describe your app',
    description:
      'Tell Orchestra what you want in plain English — screens, flows, data sources, and logic.',
  },
  {
    number: '02',
    title: 'Orchestra builds it',
    description:
      'AI generates server-driven UI definitions, wires up your data, and assembles the navigation flow.',
  },
  {
    number: '03',
    title: 'Deploy natively',
    description:
      'Push updates instantly. The native shell renders your screens — no app store resubmission required.',
  },
];

export default function HowItWorks() {
  return (
    <SectionWrapper>
      <h2 className="text-center text-3xl font-bold text-white md:text-4xl">
        How it works
      </h2>
      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.number} className="text-center">
            <span className="text-4xl font-extrabold text-accent">
              {step.number}
            </span>
            <h3 className="mt-4 text-xl font-semibold text-white">
              {step.title}
            </h3>
            <p className="mt-2 text-white/50">{step.description}</p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
